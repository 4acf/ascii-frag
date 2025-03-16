#version 330 compatibility

uniform float uResolution;
uniform sampler2D uBaseImage;
uniform sampler2D uSprite0;
uniform sampler2D uSprite1;
uniform sampler2D uSprite2;
uniform sampler2D uSprite3;
uniform sampler2D uSprite4;
uniform sampler2D uSprite5;
uniform sampler2D uSprite6;
uniform sampler2D uSprite7;

in  vec2  vST;

bool isPixelWhite(int octave, vec2 spriteST){

	vec3 spriteColor;

	//this could be improved but its fine for now
	if(octave <= 0)
		spriteColor = texture(uSprite0, spriteST).rgb;
	else if(octave == 1)
		spriteColor = texture(uSprite1, spriteST).rgb;
	else if(octave == 2)
		spriteColor = texture(uSprite2, spriteST).rgb;
	else if(octave == 3)
		spriteColor = texture(uSprite3, spriteST).rgb;
	else if(octave == 4)
		spriteColor = texture(uSprite4, spriteST).rgb;
	else if(octave == 5)
		spriteColor = texture(uSprite5, spriteST).rgb;
	else if(octave == 6)
		spriteColor = texture(uSprite6, spriteST).rgb;
	else if(octave >= 7)
		spriteColor = texture(uSprite7, spriteST).rgb;

	return spriteColor != vec3(0., 0., 0.); 

}

void main( ) {

	//for each fragment, get the "pixel" color
	vec2 st = vec2(vST.s, vST.t);
	int numins = int(st.s / uResolution);
	int numint = int(st.t / uResolution);
	float halfPixel = uResolution / 2.;
	float sCenter = numins * uResolution + halfPixel;
	float tCenter = numint * uResolution + halfPixel;
	st.s = sCenter;
	st.t = tCenter;
	vec3 pixelColor = texture(uBaseImage, st).rgb;

	//get the luminance of that pixel [0-1]
	float luminance = (pixelColor.r + pixelColor.r + pixelColor.r + pixelColor.b + pixelColor.g + pixelColor.g) / 6; 

	//quantize the luminance into one of 8 "octaves" to determine which sprite it will use
	luminance = round(luminance * 8.) / 8.;
	int octave = int(round(luminance * 8.));

	//convert the s and t coordinates of the current fragments location in relation to the center of the pixel to s and t coordinates for the sprite
	st = vec2(numins * uResolution, numint * uResolution); // we don't need center values anymore, so replace it with the bottomleft corner of this pixel
	vec2 spriteST = vec2(0., 0.);

	//these values range from [0 - uResolution]
	float sDist = vST.s - st.s;  
	float tDist = vST.t - st.t;

	//normalize them so they range from [0 - 1]
	sDist /= uResolution;
	tDist /= uResolution;
	spriteST.s = sDist;
	spriteST.t = tDist;

	//use sprite coordinates to lookup the sprite pixel
	if(isPixelWhite(octave, spriteST))
		gl_FragColor = vec4(pixelColor, 1.);
	else
		gl_FragColor = vec4(0., 0., 0., 1.);

}

