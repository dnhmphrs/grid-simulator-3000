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
      // Run resizeCanvas after the component has fully mounted
      resizeCanvas();
      renderLoop();
    }

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  function resizeCanvas() {
    if (!canvas) return; // Check if canvas is defined
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
    canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);

    // Update viewport size uniform in RenderPipeline
    updateViewportSize(device, canvas.width, canvas.height);
  }

  function renderLoop() {
    if (!device || !context || !pipeline) return; // Check if initialized

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

    // Call resizeCanvas in each loop to ensure it's updated
    resizeCanvas();
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
