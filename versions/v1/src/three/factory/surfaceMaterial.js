import * as T from 'three'

export function surfaceMaterial(color = '#6b8197') {
  return new T.ShaderMaterial({
    uniforms: { uLine: { value: new T.Color(color) }, uStrength: { value: .5 }, uHighlight: { value: 0 } },
    vertexShader: `varying vec3 vPosition; varying vec3 vNormal;
      void main(){vec4 p=modelMatrix*vec4(position,1.0);vPosition=p.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader: `varying vec3 vPosition; varying vec3 vNormal;uniform vec3 uLine;uniform float uStrength;uniform float uHighlight;
      void main(){
        vec3 n=abs(normalize(vNormal));bool roof=n.y>.65;
        vec2 uv=roof?vPosition.xz/1.45:(n.x>n.z?vec2(vPosition.z/2.2,vPosition.y/.7):vec2(vPosition.x/2.2,vPosition.y/.7));
        vec2 fw=max(fwidth(uv),vec2(.0001));vec2 g=abs(fract(uv-.5)-.5)/fw;
        float line=1.0-min(min(g.x,g.y),1.0);line=pow(line,.7);
        vec3 ground=vec3(.015,.027,.047)*(roof?1.25:.7);
        ground=mix(ground,uLine,uHighlight*.085);
        gl_FragColor=vec4(mix(ground,uLine,line*uStrength),1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: T.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  })
}
