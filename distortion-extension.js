class DistortionExtension {
  constructor(runtime) {
    this.runtime = runtime;

    this.enabled = false;

    // TurboWarp の描画フィルターを追加
    const tw = this.runtime.ioDevices.tw;
    if (tw && tw.addStageFilter) {
      this.filterId = tw.addStageFilter((gl, shaderManager) => {
        return {
          vertexShader: `
            attribute vec2 a_position;
            varying vec2 v_texcoord;
            void main() {
              v_texcoord = a_position * 0.5 + 0.5;
              gl_Position = vec4(a_position, 0, 1);
            }
          `,
          fragmentShader: `
            precision mediump float;
            varying vec2 v_texcoord;
            uniform sampler2D u_sampler;
            uniform float u_time;

            void main() {
              vec2 uv = v_texcoord;
              uv.y += 0.03 * sin(10.0 * uv.x + u_time);
              uv.x += 0.03 * cos(10.0 * uv.y + u_time);
              gl_FragColor = texture2D(u_sampler, uv);
            }
          `,
          uniforms: {
            u_time: () => performance.now() / 1000
          }
        };
      });
    }
  }

  getInfo() {
    return {
      id: 'distortion',
      name: 'ゆがみエフェクト',
      color1: '#6E57E0',
      blocks: [
        {
          opcode: 'enableEffect',
          blockType: Scratch.BlockType.COMMAND,
          text: 'ゆがみエフェクトを[ONOFF]にする',
          arguments: {
            ONOFF: {
              type: Scratch.ArgumentType.STRING,
              menu: 'onoff'
            }
          }
        }
      ],
      menus: {
        onoff: {
          acceptReporters: true,
          items: ['ON', 'OFF']
        }
      }
    };
  }

  enableEffect(args) {
    const tw = this.runtime.ioDevices.tw;
    if (!tw || !tw.setStageFilterEnabled || this.filterId == null) return;
    const on = args.ONOFF === 'ON';
    tw.setStageFilterEnabled(this.filterId, on);
  }
}

Scratch.extensions.register(new DistortionExtension(Scratch.runtime));
