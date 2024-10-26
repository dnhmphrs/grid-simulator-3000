<script>
  import { onMount } from 'svelte';
  import { initializeWebGPU } from './webgpu/WebGPUContext.js';
  import { createRenderPipeline, updateViewportSize } from './webgpu/RenderPipeline.js';

  let canvas;
  let device, context, pipeline;

  onMount(async () => {
    ({ device, context } = await initializeWebGPU(canvas));
    pipeline = await createRenderPipeline(device);

    if (device && context) {
      resizeCanvas(); // Initial resize
      renderLoop();   // Start the render loop
    }

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  function resizeCanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
    canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);

    // Pass viewport size to GPU
    updateViewportSize(device, canvas.width, canvas.height);
  }

  function renderLoop() {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0); // Draw a single triangle covering the screen
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(renderLoop);
  }
</script>

<canvas bind:this={canvas} class="geometry"></canvas>

<style>
.geometry {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  padding: 0;
  margin: 0;
  border: none;
  z-index: -1;
  /* opacity: 0;
  transition: opacity 0.5s ease-in-out; */
}
</style>
