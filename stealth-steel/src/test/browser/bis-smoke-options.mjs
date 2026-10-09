export function mutedGameUrl(input) {
  const url=new URL(input);
  url.searchParams.set('muteMusic','true');url.searchParams.set('muteSFX','true');
  return url.href;
}
export const browserOptions={headless:true,
  ...(process.env.SMOKE_CHROMIUM_EXECUTABLE?{executablePath:process.env.SMOKE_CHROMIUM_EXECUTABLE}:process.platform==='win32'?{channel:'msedge'}:{}),
  // Windows Edge uses the real WebGPU adapter. Forcing ANGLE SwiftShader there
  // exposes navigator.gpu but returns no adapter, so Babylon cannot start.
  args:['--enable-unsafe-webgpu','--mute-audio',...(process.platform==='linux'?['--enable-unsafe-swiftshader','--use-angle=swiftshader','--enable-features=Vulkan','--use-vulkan=swiftshader','--disable-vulkan-surface']:[])]};
