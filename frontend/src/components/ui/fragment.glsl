uniform float iTime;
      uniform vec3 iResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uPixelSize;
      uniform float uBorderIntensity;
      uniform float uOpacity;
      uniform float uWaveIntensity;
      uniform float uWaveWidth;
      uniform int uVariant;
      uniform sampler2D uVideoTexture;

      float waveValue(in vec2 uv, float d, float offset) {
        return 1.0 - smoothstep(0.0, d, distance(uv.x, 0.5 + sin(offset + uv.y * 3.0) * 0.3));
      }

      vec4 waveBackground(vec2 uv, float offset) {
        vec2 centeredUV = uv;

        float aspect = iResolution.x / iResolution.y;
        if (aspect > 1.0) {
          centeredUV.x = (centeredUV.x - 0.5) * aspect + 0.5;
        } else {
          centeredUV.y = (centeredUV.y - 0.5) / aspect + 0.5;
        }

        float d = (0.05 + abs(sin(offset * 0.2)) * 0.25 * distance(centeredUV.y, 0.5)) * uWaveWidth;

        float r = waveValue(centeredUV + vec2(d * 0.25, 0.0), d, offset);
        float g = waveValue(centeredUV - vec2(0.015, 0.005), d, offset);
        float b = waveValue(centeredUV - vec2(d * 0.5, 0.015), d, offset);

        return vec4(r, g, b, 1.0);
      }

      vec4 pixelate(vec2 fragCoord, vec4 backgroundColor) {
        float pixelPrecision = 3.0;
        vec2 pixel = fragCoord - vec2(ivec2(fragCoord.xy) % int(uPixelSize));
        float precisePixel = floor(uPixelSize / pixelPrecision);

        vec4 color = vec4(0.0);

        for(float i = 0.0; i < pixelPrecision; i++) {
          vec2 sampleCoord = pixel + precisePixel * i;
          vec2 sampleUV = sampleCoord / iResolution.xy;

          vec4 sourceColor;

          if (uVariant == 1) {
            sourceColor = texture2D(uVideoTexture, sampleUV);
          } else {
            sourceColor = waveBackground(sampleUV, iTime) * 0.3 +
                         waveBackground(sampleUV + vec2(0.15, 0.0), -iTime * 2.0) * 0.3 +
                         waveBackground(sampleUV + vec2(0.3, 0.0), iTime * 3.3) * 0.3 +
                         waveBackground(sampleUV - vec2(0.2, 0.0), -iTime * 1.7) * 0.3 +
                         waveBackground(sampleUV - vec2(0.4, 0.0), iTime * 2.5) * 0.3;
          }

          color += sourceColor;
        }

        color = color / pixelPrecision;

        vec3 colorMix;
        float colorIntensity;

        if (uVariant == 1) {
          colorMix = color.rgb;
          colorIntensity = (color.r + color.g + color.b) / 3.0;
        } else {
          colorMix = color.r * uColor1 + color.g * uColor2 + color.b * uColor3;
          colorIntensity = (color.r + color.g + color.b) / 3.0;
          colorMix *= uWaveIntensity;
        }

        color = vec4(colorMix, colorIntensity);

        vec4 border = vec4(0.0);
        if ((int(fragCoord.y) % int(uPixelSize) == int(0)) ||
            (int(fragCoord.x) % int(uPixelSize) == int(0))) {
          color.rgb -= vec3(uBorderIntensity * 0.3);
        }

        return color;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;

        vec4 background;

        if (uVariant == 1) {
          background = texture2D(uVideoTexture, uv);
        } else {
          background = waveBackground(uv, iTime) * 0.3 +
                      waveBackground(uv + vec2(0.15, 0.0), -iTime * 2.0) * 0.3 +
                      waveBackground(uv + vec2(0.3, 0.0), iTime * 3.3) * 0.3 +
                      waveBackground(uv - vec2(0.2, 0.0), -iTime * 1.7) * 0.3 +
                      waveBackground(uv - vec2(0.4, 0.0), iTime * 2.5) * 0.3;
        }

        vec4 mosaicColor = pixelate(fragCoord, background);

        fragColor = vec4(mosaicColor.rgb, mosaicColor.a * uOpacity);
      }

      void main() {
        vec4 color = vec4(0.0);
        mainImage(color, gl_FragCoord.xy);
        gl_FragColor = color;
      }