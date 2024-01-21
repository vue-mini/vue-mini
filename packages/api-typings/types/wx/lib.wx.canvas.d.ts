/*! *****************************************************************************
Copyright (c) 2023 Tencent, Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************** */

/* eslint-disable @typescript-eslint/naming-convention */

declare namespace WechatMiniprogram.CanvasRenderingContext {
  type CanvasDirection = 'inherit' | 'ltr' | 'rtl'
  type CanvasFillRule = 'evenodd' | 'nonzero'
  type CanvasFontKerning = 'auto' | 'none' | 'normal'
  type CanvasFontStretch =
    | 'condensed'
    | 'expanded'
    | 'extra-condensed'
    | 'extra-expanded'
    | 'normal'
    | 'semi-condensed'
    | 'semi-expanded'
    | 'ultra-condensed'
    | 'ultra-expanded'
  type CanvasFontVariantCaps =
    | 'all-petite-caps'
    | 'all-small-caps'
    | 'normal'
    | 'petite-caps'
    | 'small-caps'
    | 'titling-caps'
    | 'unicase'
  type CanvasLineCap = 'butt' | 'round' | 'square'
  type CanvasLineJoin = 'bevel' | 'miter' | 'round'
  type CanvasTextAlign = 'center' | 'end' | 'left' | 'right' | 'start'
  type CanvasTextBaseline =
    | 'alphabetic'
    | 'bottom'
    | 'hanging'
    | 'ideographic'
    | 'middle'
    | 'top'
  type CanvasTextRendering =
    | 'auto'
    | 'geometricPrecision'
    | 'optimizeLegibility'
    | 'optimizeSpeed'

  type GlobalCompositeOperation =
    | 'color'
    | 'color-burn'
    | 'color-dodge'
    | 'copy'
    | 'darken'
    | 'destination-atop'
    | 'destination-in'
    | 'destination-out'
    | 'destination-over'
    | 'difference'
    | 'exclusion'
    | 'hard-light'
    | 'hue'
    | 'lighten'
    | 'lighter'
    | 'luminosity'
    | 'multiply'
    | 'overlay'
    | 'saturation'
    | 'screen'
    | 'soft-light'
    | 'source-atop'
    | 'source-in'
    | 'source-out'
    | 'source-over'
    | 'xor'

  interface CanvasCompositing {
    globalAlpha: number
    globalCompositeOperation: GlobalCompositeOperation
  }

  type CanvasImageSource = VideoContext | Canvas | Image | OffscreenCanvas

  interface CanvasDrawImage {
    drawImage(image: CanvasImageSource, dx: number, dy: number): void
    drawImage(
      image: CanvasImageSource,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
    ): void
    drawImage(
      image: CanvasImageSource,
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
    ): void
  }

  interface CanvasDrawPath {
    beginPath(): void
    clip(fillRule?: CanvasFillRule): void
    clip(path: Path2D, fillRule?: CanvasFillRule): void
    fill(fillRule?: CanvasFillRule): void
    fill(path: Path2D, fillRule?: CanvasFillRule): void
    isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean
    isPointInPath(
      path: Path2D,
      x: number,
      y: number,
      fillRule?: CanvasFillRule,
    ): boolean
    isPointInStroke(x: number, y: number): boolean
    isPointInStroke(path: Path2D, x: number, y: number): boolean
    stroke(): void
    stroke(path: Path2D): void
  }

  interface CanvasFillStrokeStyles {
    fillStyle: string | CanvasGradient | CanvasPattern
    strokeStyle: string | CanvasGradient | CanvasPattern
    createConicGradient(
      startAngle: number,
      x: number,
      y: number,
    ): CanvasGradient
    createLinearGradient(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
    ): CanvasGradient
    createPattern(
      image: CanvasImageSource,
      repetition: string | null,
    ): CanvasPattern | null
    createRadialGradient(
      x0: number,
      y0: number,
      r0: number,
      x1: number,
      y1: number,
      r1: number,
    ): CanvasGradient
  }

  interface CanvasFilters {
    filter: string
  }

  /** An opaque object describing a gradient. It is returned by the methods CanvasRenderingContext2D.createLinearGradient() or CanvasRenderingContext2D.createRadialGradient(). */
  interface CanvasGradient {
    /**
     * Adds a color stop with the given color to the gradient at the given offset. 0.0 is the offset at one end of the gradient, 1.0 is the offset at the other end.
     *
     * Throws an "IndexSizeError" DOMException if the offset is out of range. Throws a "SyntaxError" DOMException if the color cannot be parsed.
     */
    addColorStop(offset: number, color: string): void
  }

  type PredefinedColorSpace = 'display-p3' | 'srgb'

  interface ImageDataSettings {
    colorSpace?: PredefinedColorSpace
  }

  interface CanvasImageData {
    createImageData(
      sw: number,
      sh: number,
      settings?: ImageDataSettings,
    ): ImageData
    createImageData(imagedata: ImageData): ImageData
    getImageData(
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      settings?: ImageDataSettings,
    ): ImageData
    putImageData(imagedata: ImageData, dx: number, dy: number): void
    putImageData(
      imagedata: ImageData,
      dx: number,
      dy: number,
      dirtyX: number,
      dirtyY: number,
      dirtyWidth: number,
      dirtyHeight: number,
    ): void
  }

  type ImageSmoothingQuality = 'high' | 'low' | 'medium'

  interface CanvasImageSmoothing {
    imageSmoothingEnabled: boolean
    imageSmoothingQuality: ImageSmoothingQuality
  }

  interface CanvasPath {
    arc(
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number,
      counterclockwise?: boolean,
    ): void
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
    bezierCurveTo(
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number,
    ): void
    closePath(): void
    ellipse(
      x: number,
      y: number,
      radiusX: number,
      radiusY: number,
      rotation: number,
      startAngle: number,
      endAngle: number,
      counterclockwise?: boolean,
    ): void
    lineTo(x: number, y: number): void
    moveTo(x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    rect(x: number, y: number, w: number, h: number): void
    roundRect(
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[],
    ): void
  }

  interface CanvasPathDrawingStyles {
    lineCap: CanvasLineCap
    lineDashOffset: number
    lineJoin: CanvasLineJoin
    lineWidth: number
    miterLimit: number
    getLineDash(): number[]
    setLineDash(segments: number[]): void
  }

  interface DOMMatrix2DInit {
    a?: number
    b?: number
    c?: number
    d?: number
    e?: number
    f?: number
    m11?: number
    m12?: number
    m21?: number
    m22?: number
    m41?: number
    m42?: number
  }

  /** An opaque object describing a pattern, based on an image, a canvas, or a video, created by the CanvasRenderingContext2D.createPattern() method. */
  interface CanvasPattern {
    /** Sets the transformation matrix that will be used when rendering the pattern during a fill or stroke painting operation. */
    setTransform(transform?: DOMMatrix2DInit): void
  }

  interface CanvasRect {
    clearRect(x: number, y: number, w: number, h: number): void
    fillRect(x: number, y: number, w: number, h: number): void
    strokeRect(x: number, y: number, w: number, h: number): void
  }

  interface CanvasShadowStyles {
    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number
  }

  interface CanvasState {
    restore(): void
    save(): void
  }

  /** The dimensions of a piece of text in the canvas, as created by the CanvasRenderingContext2D.measureText() method. */
  interface TextMetrics {
    /** Returns the measurement described below. */
    readonly actualBoundingBoxAscent: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxDescent: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxLeft: number
    /** Returns the measurement described below. */
    readonly actualBoundingBoxRight: number
    /** Returns the measurement described below. */
    readonly fontBoundingBoxAscent: number
    /** Returns the measurement described below. */
    readonly fontBoundingBoxDescent: number
    /** Returns the measurement described below. */
    readonly width: number
  }

  interface CanvasText {
    fillText(text: string, x: number, y: number, maxWidth?: number): void
    measureText(text: string): TextMetrics
    strokeText(text: string, x: number, y: number, maxWidth?: number): void
  }

  interface CanvasTextDrawingStyles {
    direction: CanvasDirection
    font: string
    fontKerning: CanvasFontKerning
    textAlign: CanvasTextAlign
    textBaseline: CanvasTextBaseline
  }

  interface DOMMatrixReadOnly {
    readonly a: number
    readonly b: number
    readonly c: number
    readonly d: number
    readonly e: number
    readonly f: number
    readonly is2D: boolean
    readonly isIdentity: boolean
    readonly m11: number
    readonly m12: number
    readonly m13: number
    readonly m14: number
    readonly m21: number
    readonly m22: number
    readonly m23: number
    readonly m24: number
    readonly m31: number
    readonly m32: number
    readonly m33: number
    readonly m34: number
    readonly m41: number
    readonly m42: number
    readonly m43: number
    readonly m44: number
  }

  interface CanvasTransform {
    getTransform(): DOMMatrixReadOnly
    resetTransform(): void
    rotate(angle: number): void
    scale(x: number, y: number): void
    setTransform(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ): void
    setTransform(transform?: DOMMatrix2DInit): void
    transform(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ): void
    translate(x: number, y: number): void
  }

  interface CanvasUserInterface {
    // drawFocusIfNeeded(element: Element): void;
    // drawFocusIfNeeded(path: Path2D, element: Element): void;
  }

  interface CanvasRenderingContext2DSettings {
    alpha?: boolean
    colorSpace?: PredefinedColorSpace
    desynchronized?: boolean
    willReadFrequently?: boolean
  }

  /** The CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and other objects. */
  interface CanvasRenderingContext2D
    extends CanvasCompositing,
      CanvasDrawImage,
      CanvasDrawPath,
      CanvasFillStrokeStyles,
      CanvasFilters,
      CanvasImageData,
      CanvasImageSmoothing,
      CanvasPath,
      CanvasPathDrawingStyles,
      CanvasRect,
      CanvasShadowStyles,
      CanvasState,
      CanvasText,
      CanvasTextDrawingStyles,
      CanvasTransform,
      CanvasUserInterface {
    readonly canvas: Canvas
    getContextAttributes(): CanvasRenderingContext2DSettings
  }

  type GLbitfield = number
  type GLboolean = boolean
  type GLclampf = number
  type GLenum = number
  type GLfloat = number
  type GLint = number
  type GLint64 = number
  type GLintptr = number
  type GLsizei = number
  type GLsizeiptr = number
  type GLuint = number
  type GLuint64 = number

  interface WEBGL_color_buffer_float {
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: GLenum
    readonly RGBA32F_EXT: GLenum
    readonly UNSIGNED_NORMALIZED_EXT: GLenum
  }

  interface WEBGL_compressed_texture_astc {
    getSupportedProfiles(): string[]
    readonly COMPRESSED_RGBA_ASTC_10x10_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_10x5_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_10x6_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_10x8_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_12x10_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_12x12_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_4x4_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_5x4_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_5x5_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_6x5_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_6x6_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_8x5_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_8x6_KHR: GLenum
    readonly COMPRESSED_RGBA_ASTC_8x8_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR: GLenum
  }

  interface WEBGL_compressed_texture_etc {
    readonly COMPRESSED_R11_EAC: GLenum
    readonly COMPRESSED_RG11_EAC: GLenum
    readonly COMPRESSED_RGB8_ETC2: GLenum
    readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum
    readonly COMPRESSED_RGBA8_ETC2_EAC: GLenum
    readonly COMPRESSED_SIGNED_R11_EAC: GLenum
    readonly COMPRESSED_SIGNED_RG11_EAC: GLenum
    readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: GLenum
    readonly COMPRESSED_SRGB8_ETC2: GLenum
    readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum
  }

  interface WEBGL_compressed_texture_etc1 {
    readonly COMPRESSED_RGB_ETC1_WEBGL: GLenum
  }

  /** The WEBGL_compressed_texture_s3tc extension is part of the WebGL API and exposes four S3TC compressed texture formats. */
  interface WEBGL_compressed_texture_s3tc {
    readonly COMPRESSED_RGBA_S3TC_DXT1_EXT: GLenum
    readonly COMPRESSED_RGBA_S3TC_DXT3_EXT: GLenum
    readonly COMPRESSED_RGBA_S3TC_DXT5_EXT: GLenum
    readonly COMPRESSED_RGB_S3TC_DXT1_EXT: GLenum
  }

  interface WEBGL_compressed_texture_s3tc_srgb {
    readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: GLenum
    readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: GLenum
    readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: GLenum
    readonly COMPRESSED_SRGB_S3TC_DXT1_EXT: GLenum
  }

  /** The WEBGL_debug_renderer_info extension is part of the WebGL API and exposes two constants with information about the graphics driver for debugging purposes. */
  interface WEBGL_debug_renderer_info {
    readonly UNMASKED_RENDERER_WEBGL: GLenum
    readonly UNMASKED_VENDOR_WEBGL: GLenum
  }

  interface WEBGL_debug_shaders {
    getTranslatedShaderSource(shader: WebGLShader): string
  }

  /** The WEBGL_depth_texture extension is part of the WebGL API and defines 2D depth and depth-stencil textures. */
  interface WEBGL_depth_texture {
    readonly UNSIGNED_INT_24_8_WEBGL: GLenum
  }

  interface WEBGL_draw_buffers {
    drawBuffersWEBGL(buffers: GLenum[]): void
    readonly COLOR_ATTACHMENT0_WEBGL: GLenum
    readonly COLOR_ATTACHMENT10_WEBGL: GLenum
    readonly COLOR_ATTACHMENT11_WEBGL: GLenum
    readonly COLOR_ATTACHMENT12_WEBGL: GLenum
    readonly COLOR_ATTACHMENT13_WEBGL: GLenum
    readonly COLOR_ATTACHMENT14_WEBGL: GLenum
    readonly COLOR_ATTACHMENT15_WEBGL: GLenum
    readonly COLOR_ATTACHMENT1_WEBGL: GLenum
    readonly COLOR_ATTACHMENT2_WEBGL: GLenum
    readonly COLOR_ATTACHMENT3_WEBGL: GLenum
    readonly COLOR_ATTACHMENT4_WEBGL: GLenum
    readonly COLOR_ATTACHMENT5_WEBGL: GLenum
    readonly COLOR_ATTACHMENT6_WEBGL: GLenum
    readonly COLOR_ATTACHMENT7_WEBGL: GLenum
    readonly COLOR_ATTACHMENT8_WEBGL: GLenum
    readonly COLOR_ATTACHMENT9_WEBGL: GLenum
    readonly DRAW_BUFFER0_WEBGL: GLenum
    readonly DRAW_BUFFER10_WEBGL: GLenum
    readonly DRAW_BUFFER11_WEBGL: GLenum
    readonly DRAW_BUFFER12_WEBGL: GLenum
    readonly DRAW_BUFFER13_WEBGL: GLenum
    readonly DRAW_BUFFER14_WEBGL: GLenum
    readonly DRAW_BUFFER15_WEBGL: GLenum
    readonly DRAW_BUFFER1_WEBGL: GLenum
    readonly DRAW_BUFFER2_WEBGL: GLenum
    readonly DRAW_BUFFER3_WEBGL: GLenum
    readonly DRAW_BUFFER4_WEBGL: GLenum
    readonly DRAW_BUFFER5_WEBGL: GLenum
    readonly DRAW_BUFFER6_WEBGL: GLenum
    readonly DRAW_BUFFER7_WEBGL: GLenum
    readonly DRAW_BUFFER8_WEBGL: GLenum
    readonly DRAW_BUFFER9_WEBGL: GLenum
    readonly MAX_COLOR_ATTACHMENTS_WEBGL: GLenum
    readonly MAX_DRAW_BUFFERS_WEBGL: GLenum
  }

  interface WEBGL_lose_context {
    loseContext(): void
    restoreContext(): void
  }

  interface WEBGL_multi_draw {
    multiDrawArraysInstancedWEBGL(
      mode: GLenum,
      firstsList: Int32Array | GLint[],
      firstsOffset: GLuint,
      countsList: Int32Array | GLsizei[],
      countsOffset: GLuint,
      instanceCountsList: Int32Array | GLsizei[],
      instanceCountsOffset: GLuint,
      drawcount: GLsizei,
    ): void
    multiDrawArraysWEBGL(
      mode: GLenum,
      firstsList: Int32Array | GLint[],
      firstsOffset: GLuint,
      countsList: Int32Array | GLsizei[],
      countsOffset: GLuint,
      drawcount: GLsizei,
    ): void
    multiDrawElementsInstancedWEBGL(
      mode: GLenum,
      countsList: Int32Array | GLsizei[],
      countsOffset: GLuint,
      type: GLenum,
      offsetsList: Int32Array | GLsizei[],
      offsetsOffset: GLuint,
      instanceCountsList: Int32Array | GLsizei[],
      instanceCountsOffset: GLuint,
      drawcount: GLsizei,
    ): void
    multiDrawElementsWEBGL(
      mode: GLenum,
      countsList: Int32Array | GLsizei[],
      countsOffset: GLuint,
      type: GLenum,
      offsetsList: Int32Array | GLsizei[],
      offsetsOffset: GLuint,
      drawcount: GLsizei,
    ): void
  }

  type OverSampleType = '2x' | '4x' | 'none'

  interface WebGL2RenderingContext
    extends WebGL2RenderingContextBase,
      WebGL2RenderingContextOverloads,
      WebGLRenderingContextBase {}

  type Int32List = Int32Array | GLint[]
  type Uint32List = Uint32Array | GLuint[]

  interface WebGL2RenderingContextBase {
    beginQuery(target: GLenum, query: WebGLQuery): void
    beginTransformFeedback(primitiveMode: GLenum): void
    bindBufferBase(
      target: GLenum,
      index: GLuint,
      buffer: WebGLBuffer | null,
    ): void
    bindBufferRange(
      target: GLenum,
      index: GLuint,
      buffer: WebGLBuffer | null,
      offset: GLintptr,
      size: GLsizeiptr,
    ): void
    bindSampler(unit: GLuint, sampler: WebGLSampler | null): void
    bindTransformFeedback(
      target: GLenum,
      tf: WebGLTransformFeedback | null,
    ): void
    bindVertexArray(array: WebGLVertexArrayObject | null): void
    blitFramebuffer(
      srcX0: GLint,
      srcY0: GLint,
      srcX1: GLint,
      srcY1: GLint,
      dstX0: GLint,
      dstY0: GLint,
      dstX1: GLint,
      dstY1: GLint,
      mask: GLbitfield,
      filter: GLenum,
    ): void
    clearBufferfi(
      buffer: GLenum,
      drawbuffer: GLint,
      depth: GLfloat,
      stencil: GLint,
    ): void
    clearBufferfv(
      buffer: GLenum,
      drawbuffer: GLint,
      values: Float32List,
      srcOffset?: GLuint,
    ): void
    clearBufferiv(
      buffer: GLenum,
      drawbuffer: GLint,
      values: Int32List,
      srcOffset?: GLuint,
    ): void
    clearBufferuiv(
      buffer: GLenum,
      drawbuffer: GLint,
      values: Uint32List,
      srcOffset?: GLuint,
    ): void
    clientWaitSync(
      sync: WebGLSync,
      flags: GLbitfield,
      timeout: GLuint64,
    ): GLenum
    compressedTexImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      imageSize: GLsizei,
      offset: GLintptr,
    ): void
    compressedTexImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      srcData: ArrayBufferView,
      srcOffset?: GLuint,
      srcLengthOverride?: GLuint,
    ): void
    compressedTexSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      format: GLenum,
      imageSize: GLsizei,
      offset: GLintptr,
    ): void
    compressedTexSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      format: GLenum,
      srcData: ArrayBufferView,
      srcOffset?: GLuint,
      srcLengthOverride?: GLuint,
    ): void
    copyBufferSubData(
      readTarget: GLenum,
      writeTarget: GLenum,
      readOffset: GLintptr,
      writeOffset: GLintptr,
      size: GLsizeiptr,
    ): void
    copyTexSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
    ): void
    createQuery(): WebGLQuery | null
    createSampler(): WebGLSampler | null
    createTransformFeedback(): WebGLTransformFeedback | null
    createVertexArray(): WebGLVertexArrayObject | null
    deleteQuery(query: WebGLQuery | null): void
    deleteSampler(sampler: WebGLSampler | null): void
    deleteSync(sync: WebGLSync | null): void
    deleteTransformFeedback(tf: WebGLTransformFeedback | null): void
    deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): void
    drawArraysInstanced(
      mode: GLenum,
      first: GLint,
      count: GLsizei,
      instanceCount: GLsizei,
    ): void
    drawBuffers(buffers: GLenum[]): void
    drawElementsInstanced(
      mode: GLenum,
      count: GLsizei,
      type: GLenum,
      offset: GLintptr,
      instanceCount: GLsizei,
    ): void
    drawRangeElements(
      mode: GLenum,
      start: GLuint,
      end: GLuint,
      count: GLsizei,
      type: GLenum,
      offset: GLintptr,
    ): void
    endQuery(target: GLenum): void
    endTransformFeedback(): void
    fenceSync(condition: GLenum, flags: GLbitfield): WebGLSync | null
    framebufferTextureLayer(
      target: GLenum,
      attachment: GLenum,
      texture: WebGLTexture | null,
      level: GLint,
      layer: GLint,
    ): void
    getActiveUniformBlockName(
      program: WebGLProgram,
      uniformBlockIndex: GLuint,
    ): string | null
    getActiveUniformBlockParameter(
      program: WebGLProgram,
      uniformBlockIndex: GLuint,
      pname: GLenum,
    ): any
    getActiveUniforms(
      program: WebGLProgram,
      uniformIndices: GLuint[],
      pname: GLenum,
    ): any
    getBufferSubData(
      target: GLenum,
      srcByteOffset: GLintptr,
      dstBuffer: ArrayBufferView,
      dstOffset?: GLuint,
      length?: GLuint,
    ): void
    getFragDataLocation(program: WebGLProgram, name: string): GLint
    getIndexedParameter(target: GLenum, index: GLuint): any
    getInternalformatParameter(
      target: GLenum,
      internalformat: GLenum,
      pname: GLenum,
    ): any
    getQuery(target: GLenum, pname: GLenum): WebGLQuery | null
    getQueryParameter(query: WebGLQuery, pname: GLenum): any
    getSamplerParameter(sampler: WebGLSampler, pname: GLenum): any
    getSyncParameter(sync: WebGLSync, pname: GLenum): any
    getTransformFeedbackVarying(
      program: WebGLProgram,
      index: GLuint,
    ): WebGLActiveInfo | null
    getUniformBlockIndex(
      program: WebGLProgram,
      uniformBlockName: string,
    ): GLuint
    getUniformIndices(
      program: WebGLProgram,
      uniformNames: string[],
    ): GLuint[] | null
    invalidateFramebuffer(target: GLenum, attachments: GLenum[]): void
    invalidateSubFramebuffer(
      target: GLenum,
      attachments: GLenum[],
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
    ): void
    isQuery(query: WebGLQuery | null): GLboolean
    isSampler(sampler: WebGLSampler | null): GLboolean
    isSync(sync: WebGLSync | null): GLboolean
    isTransformFeedback(tf: WebGLTransformFeedback | null): GLboolean
    isVertexArray(vertexArray: WebGLVertexArrayObject | null): GLboolean
    pauseTransformFeedback(): void
    readBuffer(src: GLenum): void
    renderbufferStorageMultisample(
      target: GLenum,
      samples: GLsizei,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
    ): void
    resumeTransformFeedback(): void
    samplerParameterf(
      sampler: WebGLSampler,
      pname: GLenum,
      param: GLfloat,
    ): void
    samplerParameteri(sampler: WebGLSampler, pname: GLenum, param: GLint): void
    texImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      pboOffset: GLintptr,
    ): void
    texImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      srcData: ArrayBufferView | null,
    ): void
    texImage3D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      srcData: ArrayBufferView,
      srcOffset: GLuint,
    ): void
    texStorage2D(
      target: GLenum,
      levels: GLsizei,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
    ): void
    texStorage3D(
      target: GLenum,
      levels: GLsizei,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
    ): void
    texSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      format: GLenum,
      type: GLenum,
      pboOffset: GLintptr,
    ): void
    texSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texSubImage3D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      zoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      depth: GLsizei,
      format: GLenum,
      type: GLenum,
      srcData: ArrayBufferView | null,
      srcOffset?: GLuint,
    ): void
    transformFeedbackVaryings(
      program: WebGLProgram,
      varyings: string[],
      bufferMode: GLenum,
    ): void
    uniform1ui(location: WebGLUniformLocation | null, v0: GLuint): void
    uniform1uiv(
      location: WebGLUniformLocation | null,
      data: Uint32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform2ui(
      location: WebGLUniformLocation | null,
      v0: GLuint,
      v1: GLuint,
    ): void
    uniform2uiv(
      location: WebGLUniformLocation | null,
      data: Uint32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform3ui(
      location: WebGLUniformLocation | null,
      v0: GLuint,
      v1: GLuint,
      v2: GLuint,
    ): void
    uniform3uiv(
      location: WebGLUniformLocation | null,
      data: Uint32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform4ui(
      location: WebGLUniformLocation | null,
      v0: GLuint,
      v1: GLuint,
      v2: GLuint,
      v3: GLuint,
    ): void
    uniform4uiv(
      location: WebGLUniformLocation | null,
      data: Uint32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformBlockBinding(
      program: WebGLProgram,
      uniformBlockIndex: GLuint,
      uniformBlockBinding: GLuint,
    ): void
    uniformMatrix2x3fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix2x4fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix3x2fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix3x4fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix4x2fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix4x3fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    vertexAttribDivisor(index: GLuint, divisor: GLuint): void
    vertexAttribI4i(index: GLuint, x: GLint, y: GLint, z: GLint, w: GLint): void
    vertexAttribI4iv(index: GLuint, values: Int32List): void
    vertexAttribI4ui(
      index: GLuint,
      x: GLuint,
      y: GLuint,
      z: GLuint,
      w: GLuint,
    ): void
    vertexAttribI4uiv(index: GLuint, values: Uint32List): void
    vertexAttribIPointer(
      index: GLuint,
      size: GLint,
      type: GLenum,
      stride: GLsizei,
      offset: GLintptr,
    ): void
    waitSync(sync: WebGLSync, flags: GLbitfield, timeout: GLint64): void
    readonly ACTIVE_UNIFORM_BLOCKS: GLenum
    readonly ALREADY_SIGNALED: GLenum
    readonly ANY_SAMPLES_PASSED: GLenum
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: GLenum
    readonly COLOR: GLenum
    readonly COLOR_ATTACHMENT1: GLenum
    readonly COLOR_ATTACHMENT10: GLenum
    readonly COLOR_ATTACHMENT11: GLenum
    readonly COLOR_ATTACHMENT12: GLenum
    readonly COLOR_ATTACHMENT13: GLenum
    readonly COLOR_ATTACHMENT14: GLenum
    readonly COLOR_ATTACHMENT15: GLenum
    readonly COLOR_ATTACHMENT2: GLenum
    readonly COLOR_ATTACHMENT3: GLenum
    readonly COLOR_ATTACHMENT4: GLenum
    readonly COLOR_ATTACHMENT5: GLenum
    readonly COLOR_ATTACHMENT6: GLenum
    readonly COLOR_ATTACHMENT7: GLenum
    readonly COLOR_ATTACHMENT8: GLenum
    readonly COLOR_ATTACHMENT9: GLenum
    readonly COMPARE_REF_TO_TEXTURE: GLenum
    readonly CONDITION_SATISFIED: GLenum
    readonly COPY_READ_BUFFER: GLenum
    readonly COPY_READ_BUFFER_BINDING: GLenum
    readonly COPY_WRITE_BUFFER: GLenum
    readonly COPY_WRITE_BUFFER_BINDING: GLenum
    readonly CURRENT_QUERY: GLenum
    readonly DEPTH: GLenum
    readonly DEPTH24_STENCIL8: GLenum
    readonly DEPTH32F_STENCIL8: GLenum
    readonly DEPTH_COMPONENT24: GLenum
    readonly DEPTH_COMPONENT32F: GLenum
    readonly DRAW_BUFFER0: GLenum
    readonly DRAW_BUFFER1: GLenum
    readonly DRAW_BUFFER10: GLenum
    readonly DRAW_BUFFER11: GLenum
    readonly DRAW_BUFFER12: GLenum
    readonly DRAW_BUFFER13: GLenum
    readonly DRAW_BUFFER14: GLenum
    readonly DRAW_BUFFER15: GLenum
    readonly DRAW_BUFFER2: GLenum
    readonly DRAW_BUFFER3: GLenum
    readonly DRAW_BUFFER4: GLenum
    readonly DRAW_BUFFER5: GLenum
    readonly DRAW_BUFFER6: GLenum
    readonly DRAW_BUFFER7: GLenum
    readonly DRAW_BUFFER8: GLenum
    readonly DRAW_BUFFER9: GLenum
    readonly DRAW_FRAMEBUFFER: GLenum
    readonly DRAW_FRAMEBUFFER_BINDING: GLenum
    readonly DYNAMIC_COPY: GLenum
    readonly DYNAMIC_READ: GLenum
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: GLenum
    readonly FLOAT_MAT2x3: GLenum
    readonly FLOAT_MAT2x4: GLenum
    readonly FLOAT_MAT3x2: GLenum
    readonly FLOAT_MAT3x4: GLenum
    readonly FLOAT_MAT4x2: GLenum
    readonly FLOAT_MAT4x3: GLenum
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: GLenum
    readonly FRAMEBUFFER_DEFAULT: GLenum
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: GLenum
    readonly HALF_FLOAT: GLenum
    readonly INTERLEAVED_ATTRIBS: GLenum
    readonly INT_2_10_10_10_REV: GLenum
    readonly INT_SAMPLER_2D: GLenum
    readonly INT_SAMPLER_2D_ARRAY: GLenum
    readonly INT_SAMPLER_3D: GLenum
    readonly INT_SAMPLER_CUBE: GLenum
    readonly INVALID_INDEX: GLenum
    readonly MAX: GLenum
    readonly MAX_3D_TEXTURE_SIZE: GLenum
    readonly MAX_ARRAY_TEXTURE_LAYERS: GLenum
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: GLenum
    readonly MAX_COLOR_ATTACHMENTS: GLenum
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: GLenum
    readonly MAX_COMBINED_UNIFORM_BLOCKS: GLenum
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: GLenum
    readonly MAX_DRAW_BUFFERS: GLenum
    readonly MAX_ELEMENTS_INDICES: GLenum
    readonly MAX_ELEMENTS_VERTICES: GLenum
    readonly MAX_ELEMENT_INDEX: GLenum
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: GLenum
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: GLenum
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: GLenum
    readonly MAX_PROGRAM_TEXEL_OFFSET: GLenum
    readonly MAX_SAMPLES: GLenum
    readonly MAX_SERVER_WAIT_TIMEOUT: GLenum
    readonly MAX_TEXTURE_LOD_BIAS: GLenum
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: GLenum
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: GLenum
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: GLenum
    readonly MAX_UNIFORM_BLOCK_SIZE: GLenum
    readonly MAX_UNIFORM_BUFFER_BINDINGS: GLenum
    readonly MAX_VARYING_COMPONENTS: GLenum
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: GLenum
    readonly MAX_VERTEX_UNIFORM_BLOCKS: GLenum
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: GLenum
    readonly MIN: GLenum
    readonly MIN_PROGRAM_TEXEL_OFFSET: GLenum
    readonly OBJECT_TYPE: GLenum
    readonly PACK_ROW_LENGTH: GLenum
    readonly PACK_SKIP_PIXELS: GLenum
    readonly PACK_SKIP_ROWS: GLenum
    readonly PIXEL_PACK_BUFFER: GLenum
    readonly PIXEL_PACK_BUFFER_BINDING: GLenum
    readonly PIXEL_UNPACK_BUFFER: GLenum
    readonly PIXEL_UNPACK_BUFFER_BINDING: GLenum
    readonly QUERY_RESULT: GLenum
    readonly QUERY_RESULT_AVAILABLE: GLenum
    readonly R11F_G11F_B10F: GLenum
    readonly R16F: GLenum
    readonly R16I: GLenum
    readonly R16UI: GLenum
    readonly R32F: GLenum
    readonly R32I: GLenum
    readonly R32UI: GLenum
    readonly R8: GLenum
    readonly R8I: GLenum
    readonly R8UI: GLenum
    readonly R8_SNORM: GLenum
    readonly RASTERIZER_DISCARD: GLenum
    readonly READ_BUFFER: GLenum
    readonly READ_FRAMEBUFFER: GLenum
    readonly READ_FRAMEBUFFER_BINDING: GLenum
    readonly RED: GLenum
    readonly RED_INTEGER: GLenum
    readonly RENDERBUFFER_SAMPLES: GLenum
    readonly RG: GLenum
    readonly RG16F: GLenum
    readonly RG16I: GLenum
    readonly RG16UI: GLenum
    readonly RG32F: GLenum
    readonly RG32I: GLenum
    readonly RG32UI: GLenum
    readonly RG8: GLenum
    readonly RG8I: GLenum
    readonly RG8UI: GLenum
    readonly RG8_SNORM: GLenum
    readonly RGB10_A2: GLenum
    readonly RGB10_A2UI: GLenum
    readonly RGB16F: GLenum
    readonly RGB16I: GLenum
    readonly RGB16UI: GLenum
    readonly RGB32F: GLenum
    readonly RGB32I: GLenum
    readonly RGB32UI: GLenum
    readonly RGB8: GLenum
    readonly RGB8I: GLenum
    readonly RGB8UI: GLenum
    readonly RGB8_SNORM: GLenum
    readonly RGB9_E5: GLenum
    readonly RGBA16F: GLenum
    readonly RGBA16I: GLenum
    readonly RGBA16UI: GLenum
    readonly RGBA32F: GLenum
    readonly RGBA32I: GLenum
    readonly RGBA32UI: GLenum
    readonly RGBA8: GLenum
    readonly RGBA8I: GLenum
    readonly RGBA8UI: GLenum
    readonly RGBA8_SNORM: GLenum
    readonly RGBA_INTEGER: GLenum
    readonly RGB_INTEGER: GLenum
    readonly RG_INTEGER: GLenum
    readonly SAMPLER_2D_ARRAY: GLenum
    readonly SAMPLER_2D_ARRAY_SHADOW: GLenum
    readonly SAMPLER_2D_SHADOW: GLenum
    readonly SAMPLER_3D: GLenum
    readonly SAMPLER_BINDING: GLenum
    readonly SAMPLER_CUBE_SHADOW: GLenum
    readonly SEPARATE_ATTRIBS: GLenum
    readonly SIGNALED: GLenum
    readonly SIGNED_NORMALIZED: GLenum
    readonly SRGB: GLenum
    readonly SRGB8: GLenum
    readonly SRGB8_ALPHA8: GLenum
    readonly STATIC_COPY: GLenum
    readonly STATIC_READ: GLenum
    readonly STENCIL: GLenum
    readonly STREAM_COPY: GLenum
    readonly STREAM_READ: GLenum
    readonly SYNC_CONDITION: GLenum
    readonly SYNC_FENCE: GLenum
    readonly SYNC_FLAGS: GLenum
    readonly SYNC_FLUSH_COMMANDS_BIT: GLenum
    readonly SYNC_GPU_COMMANDS_COMPLETE: GLenum
    readonly SYNC_STATUS: GLenum
    readonly TEXTURE_2D_ARRAY: GLenum
    readonly TEXTURE_3D: GLenum
    readonly TEXTURE_BASE_LEVEL: GLenum
    readonly TEXTURE_BINDING_2D_ARRAY: GLenum
    readonly TEXTURE_BINDING_3D: GLenum
    readonly TEXTURE_COMPARE_FUNC: GLenum
    readonly TEXTURE_COMPARE_MODE: GLenum
    readonly TEXTURE_IMMUTABLE_FORMAT: GLenum
    readonly TEXTURE_IMMUTABLE_LEVELS: GLenum
    readonly TEXTURE_MAX_LEVEL: GLenum
    readonly TEXTURE_MAX_LOD: GLenum
    readonly TEXTURE_MIN_LOD: GLenum
    readonly TEXTURE_WRAP_R: GLenum
    readonly TIMEOUT_EXPIRED: GLenum
    readonly TIMEOUT_IGNORED: GLint64
    readonly TRANSFORM_FEEDBACK: GLenum
    readonly TRANSFORM_FEEDBACK_ACTIVE: GLenum
    readonly TRANSFORM_FEEDBACK_BINDING: GLenum
    readonly TRANSFORM_FEEDBACK_BUFFER: GLenum
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: GLenum
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: GLenum
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: GLenum
    readonly TRANSFORM_FEEDBACK_BUFFER_START: GLenum
    readonly TRANSFORM_FEEDBACK_PAUSED: GLenum
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: GLenum
    readonly TRANSFORM_FEEDBACK_VARYINGS: GLenum
    readonly UNIFORM_ARRAY_STRIDE: GLenum
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: GLenum
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: GLenum
    readonly UNIFORM_BLOCK_BINDING: GLenum
    readonly UNIFORM_BLOCK_DATA_SIZE: GLenum
    readonly UNIFORM_BLOCK_INDEX: GLenum
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: GLenum
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: GLenum
    readonly UNIFORM_BUFFER: GLenum
    readonly UNIFORM_BUFFER_BINDING: GLenum
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: GLenum
    readonly UNIFORM_BUFFER_SIZE: GLenum
    readonly UNIFORM_BUFFER_START: GLenum
    readonly UNIFORM_IS_ROW_MAJOR: GLenum
    readonly UNIFORM_MATRIX_STRIDE: GLenum
    readonly UNIFORM_OFFSET: GLenum
    readonly UNIFORM_SIZE: GLenum
    readonly UNIFORM_TYPE: GLenum
    readonly UNPACK_IMAGE_HEIGHT: GLenum
    readonly UNPACK_ROW_LENGTH: GLenum
    readonly UNPACK_SKIP_IMAGES: GLenum
    readonly UNPACK_SKIP_PIXELS: GLenum
    readonly UNPACK_SKIP_ROWS: GLenum
    readonly UNSIGNALED: GLenum
    readonly UNSIGNED_INT_10F_11F_11F_REV: GLenum
    readonly UNSIGNED_INT_24_8: GLenum
    readonly UNSIGNED_INT_2_10_10_10_REV: GLenum
    readonly UNSIGNED_INT_5_9_9_9_REV: GLenum
    readonly UNSIGNED_INT_SAMPLER_2D: GLenum
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: GLenum
    readonly UNSIGNED_INT_SAMPLER_3D: GLenum
    readonly UNSIGNED_INT_SAMPLER_CUBE: GLenum
    readonly UNSIGNED_INT_VEC2: GLenum
    readonly UNSIGNED_INT_VEC3: GLenum
    readonly UNSIGNED_INT_VEC4: GLenum
    readonly UNSIGNED_NORMALIZED: GLenum
    readonly VERTEX_ARRAY_BINDING: GLenum
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: GLenum
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: GLenum
    readonly WAIT_FAILED: GLenum
  }

  interface WebGL2RenderingContextOverloads {
    bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): void
    bufferData(
      target: GLenum,
      srcData: BufferSource | null,
      usage: GLenum,
    ): void
    bufferData(
      target: GLenum,
      srcData: ArrayBufferView,
      usage: GLenum,
      srcOffset: GLuint,
      length?: GLuint,
    ): void
    bufferSubData(
      target: GLenum,
      dstByteOffset: GLintptr,
      srcData: BufferSource,
    ): void
    bufferSubData(
      target: GLenum,
      dstByteOffset: GLintptr,
      srcData: ArrayBufferView,
      srcOffset: GLuint,
      length?: GLuint,
    ): void
    compressedTexImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      imageSize: GLsizei,
      offset: GLintptr,
    ): void
    compressedTexImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      srcData: ArrayBufferView,
      srcOffset?: GLuint,
      srcLengthOverride?: GLuint,
    ): void
    compressedTexSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      imageSize: GLsizei,
      offset: GLintptr,
    ): void
    compressedTexSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      srcData: ArrayBufferView,
      srcOffset?: GLuint,
      srcLengthOverride?: GLuint,
    ): void
    readPixels(
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      dstData: ArrayBufferView | null,
    ): void
    readPixels(
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      offset: GLintptr,
    ): void
    readPixels(
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      dstData: ArrayBufferView,
      dstOffset: GLuint,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      pixels: ArrayBufferView | null,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      pboOffset: GLintptr,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      srcData: ArrayBufferView,
      srcOffset: GLuint,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      pixels: ArrayBufferView | null,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      pboOffset: GLintptr,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      srcData: ArrayBufferView,
      srcOffset: GLuint,
    ): void
    uniform1fv(
      location: WebGLUniformLocation | null,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform1iv(
      location: WebGLUniformLocation | null,
      data: Int32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform2fv(
      location: WebGLUniformLocation | null,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform2iv(
      location: WebGLUniformLocation | null,
      data: Int32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform3fv(
      location: WebGLUniformLocation | null,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform3iv(
      location: WebGLUniformLocation | null,
      data: Int32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform4fv(
      location: WebGLUniformLocation | null,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniform4iv(
      location: WebGLUniformLocation | null,
      data: Int32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix2fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix3fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
    uniformMatrix4fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      data: Float32List,
      srcOffset?: GLuint,
      srcLength?: GLuint,
    ): void
  }

  /** Part of the WebGL API and represents the information returned by calling the WebGLRenderingContext.getActiveAttrib() and WebGLRenderingContext.getActiveUniform() methods. */
  interface WebGLActiveInfo {
    readonly name: string
    readonly size: GLint
    readonly type: GLenum
  }

  /** Part of the WebGL API and represents an opaque buffer object storing data such as vertices or colors. */
  interface WebGLBuffer {}

  /** Part of the WebGL API and represents a collection of buffers that serve as a rendering destination. */
  interface WebGLFramebuffer {}

  /** The WebGLProgram is part of the WebGL API and is a combination of two compiled WebGLShaders consisting of a vertex shader and a fragment shader (both written in GLSL). */
  interface WebGLProgram {}

  interface WebGLQuery {}

  /** Part of the WebGL API and represents a buffer that can contain an image, or can be source or target of an rendering operation. */
  interface WebGLRenderbuffer {}

  /** Provides an interface to the OpenGL ES 2.0 graphics rendering context for the drawing surface of an HTML <canvas> element. */
  interface WebGLRenderingContext
    extends WebGLRenderingContextBase,
      WebGLRenderingContextOverloads {}

  /** The ANGLE_instanced_arrays extension is part of the WebGL API and allows to draw the same object, or groups of similar objects multiple times, if they share the same vertex data, primitive count and type. */
  interface ANGLE_instanced_arrays {
    drawArraysInstancedANGLE(
      mode: GLenum,
      first: GLint,
      count: GLsizei,
      primcount: GLsizei,
    ): void
    drawElementsInstancedANGLE(
      mode: GLenum,
      count: GLsizei,
      type: GLenum,
      offset: GLintptr,
      primcount: GLsizei,
    ): void
    vertexAttribDivisorANGLE(index: GLuint, divisor: GLuint): void
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: GLenum
  }

  interface EXT_blend_minmax {
    readonly MAX_EXT: GLenum
    readonly MIN_EXT: GLenum
  }

  interface EXT_color_buffer_float {}

  interface EXT_color_buffer_half_float {
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: GLenum
    readonly RGB16F_EXT: GLenum
    readonly RGBA16F_EXT: GLenum
    readonly UNSIGNED_NORMALIZED_EXT: GLenum
  }

  interface EXT_float_blend {}

  /** The EXT_frag_depth extension is part of the WebGL API and enables to set a depth value of a fragment from within the fragment shader. */
  interface EXT_frag_depth {}

  interface EXT_sRGB {
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: GLenum
    readonly SRGB8_ALPHA8_EXT: GLenum
    readonly SRGB_ALPHA_EXT: GLenum
    readonly SRGB_EXT: GLenum
  }

  interface EXT_shader_texture_lod {}

  interface EXT_texture_compression_bptc {
    readonly COMPRESSED_RGBA_BPTC_UNORM_EXT: GLenum
    readonly COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: GLenum
    readonly COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT: GLenum
    readonly COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: GLenum
  }

  interface EXT_texture_compression_rgtc {
    readonly COMPRESSED_RED_GREEN_RGTC2_EXT: GLenum
    readonly COMPRESSED_RED_RGTC1_EXT: GLenum
    readonly COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: GLenum
    readonly COMPRESSED_SIGNED_RED_RGTC1_EXT: GLenum
  }

  /** The EXT_texture_filter_anisotropic extension is part of the WebGL API and exposes two constants for anisotropic filtering (AF). */
  interface EXT_texture_filter_anisotropic {
    readonly MAX_TEXTURE_MAX_ANISOTROPY_EXT: GLenum
    readonly TEXTURE_MAX_ANISOTROPY_EXT: GLenum
  }

  interface EXT_texture_norm16 {
    readonly R16_EXT: GLenum
    readonly R16_SNORM_EXT: GLenum
    readonly RG16_EXT: GLenum
    readonly RG16_SNORM_EXT: GLenum
    readonly RGB16_EXT: GLenum
    readonly RGB16_SNORM_EXT: GLenum
    readonly RGBA16_EXT: GLenum
    readonly RGBA16_SNORM_EXT: GLenum
  }

  interface KHR_parallel_shader_compile {
    readonly COMPLETION_STATUS_KHR: GLenum
  }

  interface OES_draw_buffers_indexed {
    blendEquationSeparateiOES(
      buf: GLuint,
      modeRGB: GLenum,
      modeAlpha: GLenum,
    ): void
    blendEquationiOES(buf: GLuint, mode: GLenum): void
    blendFuncSeparateiOES(
      buf: GLuint,
      srcRGB: GLenum,
      dstRGB: GLenum,
      srcAlpha: GLenum,
      dstAlpha: GLenum,
    ): void
    blendFunciOES(buf: GLuint, src: GLenum, dst: GLenum): void
    colorMaskiOES(
      buf: GLuint,
      r: GLboolean,
      g: GLboolean,
      b: GLboolean,
      a: GLboolean,
    ): void
    disableiOES(target: GLenum, index: GLuint): void
    enableiOES(target: GLenum, index: GLuint): void
  }

  /** The OES_element_index_uint extension is part of the WebGL API and adds support for gl.UNSIGNED_INT types to WebGLRenderingContext.drawElements(). */
  interface OES_element_index_uint {}

  interface OES_fbo_render_mipmap {}

  /** The OES_standard_derivatives extension is part of the WebGL API and adds the GLSL derivative functions dFdx, dFdy, and fwidth. */
  interface OES_standard_derivatives {
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT_OES: GLenum
  }

  /** The OES_texture_float extension is part of the WebGL API and exposes floating-point pixel types for textures. */
  interface OES_texture_float {}

  /** The OES_texture_float_linear extension is part of the WebGL API and allows linear filtering with floating-point pixel types for textures. */
  interface OES_texture_float_linear {}

  /** The OES_texture_half_float extension is part of the WebGL API and adds texture formats with 16- (aka half float) and 32-bit floating-point components. */
  interface OES_texture_half_float {
    readonly HALF_FLOAT_OES: GLenum
  }

  /** The OES_texture_half_float_linear extension is part of the WebGL API and allows linear filtering with half floating-point pixel types for textures. */
  interface OES_texture_half_float_linear {}

  interface OES_vertex_array_object {
    bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void
    createVertexArrayOES(): WebGLVertexArrayObjectOES | null
    deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void
    isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): GLboolean
    readonly VERTEX_ARRAY_BINDING_OES: GLenum
  }

  interface OVR_multiview2 {
    framebufferTextureMultiviewOVR(
      target: GLenum,
      attachment: GLenum,
      texture: WebGLTexture | null,
      level: GLint,
      baseViewIndex: GLint,
      numViews: GLsizei,
    ): void
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_BASE_VIEW_INDEX_OVR: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_NUM_VIEWS_OVR: GLenum
    readonly FRAMEBUFFER_INCOMPLETE_VIEW_TARGETS_OVR: GLenum
    readonly MAX_VIEWS_OVR: GLenum
  }

  type WebGLPowerPreference = 'default' | 'high-performance' | 'low-power'

  interface WebGLContextAttributes {
    alpha?: boolean
    antialias?: boolean
    depth?: boolean
    desynchronized?: boolean
    failIfMajorPerformanceCaveat?: boolean
    powerPreference?: WebGLPowerPreference
    premultipliedAlpha?: boolean
    preserveDrawingBuffer?: boolean
    stencil?: boolean
  }

  interface WebGLRenderingContextBase {
    readonly canvas: Canvas
    readonly drawingBufferHeight: GLsizei
    readonly drawingBufferWidth: GLsizei
    activeTexture(texture: GLenum): void
    attachShader(program: WebGLProgram, shader: WebGLShader): void
    bindAttribLocation(program: WebGLProgram, index: GLuint, name: string): void
    bindBuffer(target: GLenum, buffer: WebGLBuffer | null): void
    bindFramebuffer(target: GLenum, framebuffer: WebGLFramebuffer | null): void
    bindRenderbuffer(
      target: GLenum,
      renderbuffer: WebGLRenderbuffer | null,
    ): void
    bindTexture(target: GLenum, texture: WebGLTexture | null): void
    blendColor(
      red: GLclampf,
      green: GLclampf,
      blue: GLclampf,
      alpha: GLclampf,
    ): void
    blendEquation(mode: GLenum): void
    blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum): void
    blendFunc(sfactor: GLenum, dfactor: GLenum): void
    blendFuncSeparate(
      srcRGB: GLenum,
      dstRGB: GLenum,
      srcAlpha: GLenum,
      dstAlpha: GLenum,
    ): void
    checkFramebufferStatus(target: GLenum): GLenum
    clear(mask: GLbitfield): void
    clearColor(
      red: GLclampf,
      green: GLclampf,
      blue: GLclampf,
      alpha: GLclampf,
    ): void
    clearDepth(depth: GLclampf): void
    clearStencil(s: GLint): void
    colorMask(
      red: GLboolean,
      green: GLboolean,
      blue: GLboolean,
      alpha: GLboolean,
    ): void
    compileShader(shader: WebGLShader): void
    copyTexImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
    ): void
    copyTexSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
    ): void
    createBuffer(): WebGLBuffer | null
    createFramebuffer(): WebGLFramebuffer | null
    createProgram(): WebGLProgram | null
    createRenderbuffer(): WebGLRenderbuffer | null
    createShader(type: GLenum): WebGLShader | null
    createTexture(): WebGLTexture | null
    cullFace(mode: GLenum): void
    deleteBuffer(buffer: WebGLBuffer | null): void
    deleteFramebuffer(framebuffer: WebGLFramebuffer | null): void
    deleteProgram(program: WebGLProgram | null): void
    deleteRenderbuffer(renderbuffer: WebGLRenderbuffer | null): void
    deleteShader(shader: WebGLShader | null): void
    deleteTexture(texture: WebGLTexture | null): void
    depthFunc(func: GLenum): void
    depthMask(flag: GLboolean): void
    depthRange(zNear: GLclampf, zFar: GLclampf): void
    detachShader(program: WebGLProgram, shader: WebGLShader): void
    disable(cap: GLenum): void
    disableVertexAttribArray(index: GLuint): void
    drawArrays(mode: GLenum, first: GLint, count: GLsizei): void
    drawElements(
      mode: GLenum,
      count: GLsizei,
      type: GLenum,
      offset: GLintptr,
    ): void
    enable(cap: GLenum): void
    enableVertexAttribArray(index: GLuint): void
    finish(): void
    flush(): void
    framebufferRenderbuffer(
      target: GLenum,
      attachment: GLenum,
      renderbuffertarget: GLenum,
      renderbuffer: WebGLRenderbuffer | null,
    ): void
    framebufferTexture2D(
      target: GLenum,
      attachment: GLenum,
      textarget: GLenum,
      texture: WebGLTexture | null,
      level: GLint,
    ): void
    frontFace(mode: GLenum): void
    generateMipmap(target: GLenum): void
    getActiveAttrib(
      program: WebGLProgram,
      index: GLuint,
    ): WebGLActiveInfo | null
    getActiveUniform(
      program: WebGLProgram,
      index: GLuint,
    ): WebGLActiveInfo | null
    getAttachedShaders(program: WebGLProgram): WebGLShader[] | null
    getAttribLocation(program: WebGLProgram, name: string): GLint
    getBufferParameter(target: GLenum, pname: GLenum): any
    getContextAttributes(): WebGLContextAttributes | null
    getError(): GLenum
    getExtension(
      extensionName: 'ANGLE_instanced_arrays',
    ): ANGLE_instanced_arrays | null
    getExtension(extensionName: 'EXT_blend_minmax'): EXT_blend_minmax | null
    getExtension(
      extensionName: 'EXT_color_buffer_float',
    ): EXT_color_buffer_float | null
    getExtension(
      extensionName: 'EXT_color_buffer_half_float',
    ): EXT_color_buffer_half_float | null
    getExtension(extensionName: 'EXT_float_blend'): EXT_float_blend | null
    getExtension(extensionName: 'EXT_frag_depth'): EXT_frag_depth | null
    getExtension(extensionName: 'EXT_sRGB'): EXT_sRGB | null
    getExtension(
      extensionName: 'EXT_shader_texture_lod',
    ): EXT_shader_texture_lod | null
    getExtension(
      extensionName: 'EXT_texture_compression_bptc',
    ): EXT_texture_compression_bptc | null
    getExtension(
      extensionName: 'EXT_texture_compression_rgtc',
    ): EXT_texture_compression_rgtc | null
    getExtension(
      extensionName: 'EXT_texture_filter_anisotropic',
    ): EXT_texture_filter_anisotropic | null
    getExtension(
      extensionName: 'KHR_parallel_shader_compile',
    ): KHR_parallel_shader_compile | null
    getExtension(
      extensionName: 'OES_element_index_uint',
    ): OES_element_index_uint | null
    getExtension(
      extensionName: 'OES_fbo_render_mipmap',
    ): OES_fbo_render_mipmap | null
    getExtension(
      extensionName: 'OES_standard_derivatives',
    ): OES_standard_derivatives | null
    getExtension(extensionName: 'OES_texture_float'): OES_texture_float | null
    getExtension(
      extensionName: 'OES_texture_float_linear',
    ): OES_texture_float_linear | null
    getExtension(
      extensionName: 'OES_texture_half_float',
    ): OES_texture_half_float | null
    getExtension(
      extensionName: 'OES_texture_half_float_linear',
    ): OES_texture_half_float_linear | null
    getExtension(
      extensionName: 'OES_vertex_array_object',
    ): OES_vertex_array_object | null
    getExtension(extensionName: 'OVR_multiview2'): OVR_multiview2 | null
    getExtension(
      extensionName: 'WEBGL_color_buffer_float',
    ): WEBGL_color_buffer_float | null
    getExtension(
      extensionName: 'WEBGL_compressed_texture_astc',
    ): WEBGL_compressed_texture_astc | null
    getExtension(
      extensionName: 'WEBGL_compressed_texture_etc',
    ): WEBGL_compressed_texture_etc | null
    getExtension(
      extensionName: 'WEBGL_compressed_texture_etc1',
    ): WEBGL_compressed_texture_etc1 | null
    getExtension(
      extensionName: 'WEBGL_compressed_texture_s3tc',
    ): WEBGL_compressed_texture_s3tc | null
    getExtension(
      extensionName: 'WEBGL_compressed_texture_s3tc_srgb',
    ): WEBGL_compressed_texture_s3tc_srgb | null
    getExtension(
      extensionName: 'WEBGL_debug_renderer_info',
    ): WEBGL_debug_renderer_info | null
    getExtension(
      extensionName: 'WEBGL_debug_shaders',
    ): WEBGL_debug_shaders | null
    getExtension(
      extensionName: 'WEBGL_depth_texture',
    ): WEBGL_depth_texture | null
    getExtension(extensionName: 'WEBGL_draw_buffers'): WEBGL_draw_buffers | null
    getExtension(extensionName: 'WEBGL_lose_context'): WEBGL_lose_context | null
    getExtension(extensionName: 'WEBGL_multi_draw'): WEBGL_multi_draw | null
    getExtension(name: string): any
    getFramebufferAttachmentParameter(
      target: GLenum,
      attachment: GLenum,
      pname: GLenum,
    ): any
    getParameter(pname: GLenum): any
    getProgramInfoLog(program: WebGLProgram): string | null
    getProgramParameter(program: WebGLProgram, pname: GLenum): any
    getRenderbufferParameter(target: GLenum, pname: GLenum): any
    getShaderInfoLog(shader: WebGLShader): string | null
    getShaderParameter(shader: WebGLShader, pname: GLenum): any
    getShaderPrecisionFormat(
      shadertype: GLenum,
      precisiontype: GLenum,
    ): WebGLShaderPrecisionFormat | null
    getShaderSource(shader: WebGLShader): string | null
    getSupportedExtensions(): string[] | null
    getTexParameter(target: GLenum, pname: GLenum): any
    getUniform(program: WebGLProgram, location: WebGLUniformLocation): any
    getUniformLocation(
      program: WebGLProgram,
      name: string,
    ): WebGLUniformLocation | null
    getVertexAttrib(index: GLuint, pname: GLenum): any
    getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr
    hint(target: GLenum, mode: GLenum): void
    isBuffer(buffer: WebGLBuffer | null): GLboolean
    isContextLost(): boolean
    isEnabled(cap: GLenum): GLboolean
    isFramebuffer(framebuffer: WebGLFramebuffer | null): GLboolean
    isProgram(program: WebGLProgram | null): GLboolean
    isRenderbuffer(renderbuffer: WebGLRenderbuffer | null): GLboolean
    isShader(shader: WebGLShader | null): GLboolean
    isTexture(texture: WebGLTexture | null): GLboolean
    lineWidth(width: GLfloat): void
    linkProgram(program: WebGLProgram): void
    pixelStorei(pname: GLenum, param: GLint | GLboolean): void
    polygonOffset(factor: GLfloat, units: GLfloat): void
    renderbufferStorage(
      target: GLenum,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
    ): void
    sampleCoverage(value: GLclampf, invert: GLboolean): void
    scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void
    shaderSource(shader: WebGLShader, source: string): void
    stencilFunc(func: GLenum, ref: GLint, mask: GLuint): void
    stencilFuncSeparate(
      face: GLenum,
      func: GLenum,
      ref: GLint,
      mask: GLuint,
    ): void
    stencilMask(mask: GLuint): void
    stencilMaskSeparate(face: GLenum, mask: GLuint): void
    stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum): void
    stencilOpSeparate(
      face: GLenum,
      fail: GLenum,
      zfail: GLenum,
      zpass: GLenum,
    ): void
    texParameterf(target: GLenum, pname: GLenum, param: GLfloat): void
    texParameteri(target: GLenum, pname: GLenum, param: GLint): void
    uniform1f(location: WebGLUniformLocation | null, x: GLfloat): void
    uniform1i(location: WebGLUniformLocation | null, x: GLint): void
    uniform2f(
      location: WebGLUniformLocation | null,
      x: GLfloat,
      y: GLfloat,
    ): void
    uniform2i(location: WebGLUniformLocation | null, x: GLint, y: GLint): void
    uniform3f(
      location: WebGLUniformLocation | null,
      x: GLfloat,
      y: GLfloat,
      z: GLfloat,
    ): void
    uniform3i(
      location: WebGLUniformLocation | null,
      x: GLint,
      y: GLint,
      z: GLint,
    ): void
    uniform4f(
      location: WebGLUniformLocation | null,
      x: GLfloat,
      y: GLfloat,
      z: GLfloat,
      w: GLfloat,
    ): void
    uniform4i(
      location: WebGLUniformLocation | null,
      x: GLint,
      y: GLint,
      z: GLint,
      w: GLint,
    ): void
    useProgram(program: WebGLProgram | null): void
    validateProgram(program: WebGLProgram): void
    vertexAttrib1f(index: GLuint, x: GLfloat): void
    vertexAttrib1fv(index: GLuint, values: Float32List): void
    vertexAttrib2f(index: GLuint, x: GLfloat, y: GLfloat): void
    vertexAttrib2fv(index: GLuint, values: Float32List): void
    vertexAttrib3f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat): void
    vertexAttrib3fv(index: GLuint, values: Float32List): void
    vertexAttrib4f(
      index: GLuint,
      x: GLfloat,
      y: GLfloat,
      z: GLfloat,
      w: GLfloat,
    ): void
    vertexAttrib4fv(index: GLuint, values: Float32List): void
    vertexAttribPointer(
      index: GLuint,
      size: GLint,
      type: GLenum,
      normalized: GLboolean,
      stride: GLsizei,
      offset: GLintptr,
    ): void
    viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void
    readonly ACTIVE_ATTRIBUTES: GLenum
    readonly ACTIVE_TEXTURE: GLenum
    readonly ACTIVE_UNIFORMS: GLenum
    readonly ALIASED_LINE_WIDTH_RANGE: GLenum
    readonly ALIASED_POINT_SIZE_RANGE: GLenum
    readonly ALPHA: GLenum
    readonly ALPHA_BITS: GLenum
    readonly ALWAYS: GLenum
    readonly ARRAY_BUFFER: GLenum
    readonly ARRAY_BUFFER_BINDING: GLenum
    readonly ATTACHED_SHADERS: GLenum
    readonly BACK: GLenum
    readonly BLEND: GLenum
    readonly BLEND_COLOR: GLenum
    readonly BLEND_DST_ALPHA: GLenum
    readonly BLEND_DST_RGB: GLenum
    readonly BLEND_EQUATION: GLenum
    readonly BLEND_EQUATION_ALPHA: GLenum
    readonly BLEND_EQUATION_RGB: GLenum
    readonly BLEND_SRC_ALPHA: GLenum
    readonly BLEND_SRC_RGB: GLenum
    readonly BLUE_BITS: GLenum
    readonly BOOL: GLenum
    readonly BOOL_VEC2: GLenum
    readonly BOOL_VEC3: GLenum
    readonly BOOL_VEC4: GLenum
    readonly BROWSER_DEFAULT_WEBGL: GLenum
    readonly BUFFER_SIZE: GLenum
    readonly BUFFER_USAGE: GLenum
    readonly BYTE: GLenum
    readonly CCW: GLenum
    readonly CLAMP_TO_EDGE: GLenum
    readonly COLOR_ATTACHMENT0: GLenum
    readonly COLOR_BUFFER_BIT: GLenum
    readonly COLOR_CLEAR_VALUE: GLenum
    readonly COLOR_WRITEMASK: GLenum
    readonly COMPILE_STATUS: GLenum
    readonly COMPRESSED_TEXTURE_FORMATS: GLenum
    readonly CONSTANT_ALPHA: GLenum
    readonly CONSTANT_COLOR: GLenum
    readonly CONTEXT_LOST_WEBGL: GLenum
    readonly CULL_FACE: GLenum
    readonly CULL_FACE_MODE: GLenum
    readonly CURRENT_PROGRAM: GLenum
    readonly CURRENT_VERTEX_ATTRIB: GLenum
    readonly CW: GLenum
    readonly DECR: GLenum
    readonly DECR_WRAP: GLenum
    readonly DELETE_STATUS: GLenum
    readonly DEPTH_ATTACHMENT: GLenum
    readonly DEPTH_BITS: GLenum
    readonly DEPTH_BUFFER_BIT: GLenum
    readonly DEPTH_CLEAR_VALUE: GLenum
    readonly DEPTH_COMPONENT: GLenum
    readonly DEPTH_COMPONENT16: GLenum
    readonly DEPTH_FUNC: GLenum
    readonly DEPTH_RANGE: GLenum
    readonly DEPTH_STENCIL: GLenum
    readonly DEPTH_STENCIL_ATTACHMENT: GLenum
    readonly DEPTH_TEST: GLenum
    readonly DEPTH_WRITEMASK: GLenum
    readonly DITHER: GLenum
    readonly DONT_CARE: GLenum
    readonly DST_ALPHA: GLenum
    readonly DST_COLOR: GLenum
    readonly DYNAMIC_DRAW: GLenum
    readonly ELEMENT_ARRAY_BUFFER: GLenum
    readonly ELEMENT_ARRAY_BUFFER_BINDING: GLenum
    readonly EQUAL: GLenum
    readonly FASTEST: GLenum
    readonly FLOAT: GLenum
    readonly FLOAT_MAT2: GLenum
    readonly FLOAT_MAT3: GLenum
    readonly FLOAT_MAT4: GLenum
    readonly FLOAT_VEC2: GLenum
    readonly FLOAT_VEC3: GLenum
    readonly FLOAT_VEC4: GLenum
    readonly FRAGMENT_SHADER: GLenum
    readonly FRAMEBUFFER: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: GLenum
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: GLenum
    readonly FRAMEBUFFER_BINDING: GLenum
    readonly FRAMEBUFFER_COMPLETE: GLenum
    readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: GLenum
    readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: GLenum
    readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: GLenum
    readonly FRAMEBUFFER_UNSUPPORTED: GLenum
    readonly FRONT: GLenum
    readonly FRONT_AND_BACK: GLenum
    readonly FRONT_FACE: GLenum
    readonly FUNC_ADD: GLenum
    readonly FUNC_REVERSE_SUBTRACT: GLenum
    readonly FUNC_SUBTRACT: GLenum
    readonly GENERATE_MIPMAP_HINT: GLenum
    readonly GEQUAL: GLenum
    readonly GREATER: GLenum
    readonly GREEN_BITS: GLenum
    readonly HIGH_FLOAT: GLenum
    readonly HIGH_INT: GLenum
    readonly IMPLEMENTATION_COLOR_READ_FORMAT: GLenum
    readonly IMPLEMENTATION_COLOR_READ_TYPE: GLenum
    readonly INCR: GLenum
    readonly INCR_WRAP: GLenum
    readonly INT: GLenum
    readonly INT_VEC2: GLenum
    readonly INT_VEC3: GLenum
    readonly INT_VEC4: GLenum
    readonly INVALID_ENUM: GLenum
    readonly INVALID_FRAMEBUFFER_OPERATION: GLenum
    readonly INVALID_OPERATION: GLenum
    readonly INVALID_VALUE: GLenum
    readonly INVERT: GLenum
    readonly KEEP: GLenum
    readonly LEQUAL: GLenum
    readonly LESS: GLenum
    readonly LINEAR: GLenum
    readonly LINEAR_MIPMAP_LINEAR: GLenum
    readonly LINEAR_MIPMAP_NEAREST: GLenum
    readonly LINES: GLenum
    readonly LINE_LOOP: GLenum
    readonly LINE_STRIP: GLenum
    readonly LINE_WIDTH: GLenum
    readonly LINK_STATUS: GLenum
    readonly LOW_FLOAT: GLenum
    readonly LOW_INT: GLenum
    readonly LUMINANCE: GLenum
    readonly LUMINANCE_ALPHA: GLenum
    readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: GLenum
    readonly MAX_CUBE_MAP_TEXTURE_SIZE: GLenum
    readonly MAX_FRAGMENT_UNIFORM_VECTORS: GLenum
    readonly MAX_RENDERBUFFER_SIZE: GLenum
    readonly MAX_TEXTURE_IMAGE_UNITS: GLenum
    readonly MAX_TEXTURE_SIZE: GLenum
    readonly MAX_VARYING_VECTORS: GLenum
    readonly MAX_VERTEX_ATTRIBS: GLenum
    readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: GLenum
    readonly MAX_VERTEX_UNIFORM_VECTORS: GLenum
    readonly MAX_VIEWPORT_DIMS: GLenum
    readonly MEDIUM_FLOAT: GLenum
    readonly MEDIUM_INT: GLenum
    readonly MIRRORED_REPEAT: GLenum
    readonly NEAREST: GLenum
    readonly NEAREST_MIPMAP_LINEAR: GLenum
    readonly NEAREST_MIPMAP_NEAREST: GLenum
    readonly NEVER: GLenum
    readonly NICEST: GLenum
    readonly NONE: GLenum
    readonly NOTEQUAL: GLenum
    readonly NO_ERROR: GLenum
    readonly ONE: GLenum
    readonly ONE_MINUS_CONSTANT_ALPHA: GLenum
    readonly ONE_MINUS_CONSTANT_COLOR: GLenum
    readonly ONE_MINUS_DST_ALPHA: GLenum
    readonly ONE_MINUS_DST_COLOR: GLenum
    readonly ONE_MINUS_SRC_ALPHA: GLenum
    readonly ONE_MINUS_SRC_COLOR: GLenum
    readonly OUT_OF_MEMORY: GLenum
    readonly PACK_ALIGNMENT: GLenum
    readonly POINTS: GLenum
    readonly POLYGON_OFFSET_FACTOR: GLenum
    readonly POLYGON_OFFSET_FILL: GLenum
    readonly POLYGON_OFFSET_UNITS: GLenum
    readonly RED_BITS: GLenum
    readonly RENDERBUFFER: GLenum
    readonly RENDERBUFFER_ALPHA_SIZE: GLenum
    readonly RENDERBUFFER_BINDING: GLenum
    readonly RENDERBUFFER_BLUE_SIZE: GLenum
    readonly RENDERBUFFER_DEPTH_SIZE: GLenum
    readonly RENDERBUFFER_GREEN_SIZE: GLenum
    readonly RENDERBUFFER_HEIGHT: GLenum
    readonly RENDERBUFFER_INTERNAL_FORMAT: GLenum
    readonly RENDERBUFFER_RED_SIZE: GLenum
    readonly RENDERBUFFER_STENCIL_SIZE: GLenum
    readonly RENDERBUFFER_WIDTH: GLenum
    readonly RENDERER: GLenum
    readonly REPEAT: GLenum
    readonly REPLACE: GLenum
    readonly RGB: GLenum
    readonly RGB565: GLenum
    readonly RGB5_A1: GLenum
    readonly RGBA: GLenum
    readonly RGBA4: GLenum
    readonly SAMPLER_2D: GLenum
    readonly SAMPLER_CUBE: GLenum
    readonly SAMPLES: GLenum
    readonly SAMPLE_ALPHA_TO_COVERAGE: GLenum
    readonly SAMPLE_BUFFERS: GLenum
    readonly SAMPLE_COVERAGE: GLenum
    readonly SAMPLE_COVERAGE_INVERT: GLenum
    readonly SAMPLE_COVERAGE_VALUE: GLenum
    readonly SCISSOR_BOX: GLenum
    readonly SCISSOR_TEST: GLenum
    readonly SHADER_TYPE: GLenum
    readonly SHADING_LANGUAGE_VERSION: GLenum
    readonly SHORT: GLenum
    readonly SRC_ALPHA: GLenum
    readonly SRC_ALPHA_SATURATE: GLenum
    readonly SRC_COLOR: GLenum
    readonly STATIC_DRAW: GLenum
    readonly STENCIL_ATTACHMENT: GLenum
    readonly STENCIL_BACK_FAIL: GLenum
    readonly STENCIL_BACK_FUNC: GLenum
    readonly STENCIL_BACK_PASS_DEPTH_FAIL: GLenum
    readonly STENCIL_BACK_PASS_DEPTH_PASS: GLenum
    readonly STENCIL_BACK_REF: GLenum
    readonly STENCIL_BACK_VALUE_MASK: GLenum
    readonly STENCIL_BACK_WRITEMASK: GLenum
    readonly STENCIL_BITS: GLenum
    readonly STENCIL_BUFFER_BIT: GLenum
    readonly STENCIL_CLEAR_VALUE: GLenum
    readonly STENCIL_FAIL: GLenum
    readonly STENCIL_FUNC: GLenum
    readonly STENCIL_INDEX8: GLenum
    readonly STENCIL_PASS_DEPTH_FAIL: GLenum
    readonly STENCIL_PASS_DEPTH_PASS: GLenum
    readonly STENCIL_REF: GLenum
    readonly STENCIL_TEST: GLenum
    readonly STENCIL_VALUE_MASK: GLenum
    readonly STENCIL_WRITEMASK: GLenum
    readonly STREAM_DRAW: GLenum
    readonly SUBPIXEL_BITS: GLenum
    readonly TEXTURE: GLenum
    readonly TEXTURE0: GLenum
    readonly TEXTURE1: GLenum
    readonly TEXTURE10: GLenum
    readonly TEXTURE11: GLenum
    readonly TEXTURE12: GLenum
    readonly TEXTURE13: GLenum
    readonly TEXTURE14: GLenum
    readonly TEXTURE15: GLenum
    readonly TEXTURE16: GLenum
    readonly TEXTURE17: GLenum
    readonly TEXTURE18: GLenum
    readonly TEXTURE19: GLenum
    readonly TEXTURE2: GLenum
    readonly TEXTURE20: GLenum
    readonly TEXTURE21: GLenum
    readonly TEXTURE22: GLenum
    readonly TEXTURE23: GLenum
    readonly TEXTURE24: GLenum
    readonly TEXTURE25: GLenum
    readonly TEXTURE26: GLenum
    readonly TEXTURE27: GLenum
    readonly TEXTURE28: GLenum
    readonly TEXTURE29: GLenum
    readonly TEXTURE3: GLenum
    readonly TEXTURE30: GLenum
    readonly TEXTURE31: GLenum
    readonly TEXTURE4: GLenum
    readonly TEXTURE5: GLenum
    readonly TEXTURE6: GLenum
    readonly TEXTURE7: GLenum
    readonly TEXTURE8: GLenum
    readonly TEXTURE9: GLenum
    readonly TEXTURE_2D: GLenum
    readonly TEXTURE_BINDING_2D: GLenum
    readonly TEXTURE_BINDING_CUBE_MAP: GLenum
    readonly TEXTURE_CUBE_MAP: GLenum
    readonly TEXTURE_CUBE_MAP_NEGATIVE_X: GLenum
    readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: GLenum
    readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: GLenum
    readonly TEXTURE_CUBE_MAP_POSITIVE_X: GLenum
    readonly TEXTURE_CUBE_MAP_POSITIVE_Y: GLenum
    readonly TEXTURE_CUBE_MAP_POSITIVE_Z: GLenum
    readonly TEXTURE_MAG_FILTER: GLenum
    readonly TEXTURE_MIN_FILTER: GLenum
    readonly TEXTURE_WRAP_S: GLenum
    readonly TEXTURE_WRAP_T: GLenum
    readonly TRIANGLES: GLenum
    readonly TRIANGLE_FAN: GLenum
    readonly TRIANGLE_STRIP: GLenum
    readonly UNPACK_ALIGNMENT: GLenum
    readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: GLenum
    readonly UNPACK_FLIP_Y_WEBGL: GLenum
    readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLenum
    readonly UNSIGNED_BYTE: GLenum
    readonly UNSIGNED_INT: GLenum
    readonly UNSIGNED_SHORT: GLenum
    readonly UNSIGNED_SHORT_4_4_4_4: GLenum
    readonly UNSIGNED_SHORT_5_5_5_1: GLenum
    readonly UNSIGNED_SHORT_5_6_5: GLenum
    readonly VALIDATE_STATUS: GLenum
    readonly VENDOR: GLenum
    readonly VERSION: GLenum
    readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: GLenum
    readonly VERTEX_ATTRIB_ARRAY_ENABLED: GLenum
    readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: GLenum
    readonly VERTEX_ATTRIB_ARRAY_POINTER: GLenum
    readonly VERTEX_ATTRIB_ARRAY_SIZE: GLenum
    readonly VERTEX_ATTRIB_ARRAY_STRIDE: GLenum
    readonly VERTEX_ATTRIB_ARRAY_TYPE: GLenum
    readonly VERTEX_SHADER: GLenum
    readonly VIEWPORT: GLenum
    readonly ZERO: GLenum
  }

  type BufferSource = ArrayBufferView | ArrayBuffer
  type Float32List = Float32Array | GLfloat[]
  type TexImageSource =
    | Image
    | ImageData
    | Canvas
    | OffscreenCanvas
    | VideoContext

  interface WebGLRenderingContextOverloads {
    bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): void
    bufferData(target: GLenum, data: BufferSource | null, usage: GLenum): void
    bufferSubData(target: GLenum, offset: GLintptr, data: BufferSource): void
    compressedTexImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLenum,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      data: ArrayBufferView,
    ): void
    compressedTexSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      data: ArrayBufferView,
    ): void
    readPixels(
      x: GLint,
      y: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      pixels: ArrayBufferView | null,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      width: GLsizei,
      height: GLsizei,
      border: GLint,
      format: GLenum,
      type: GLenum,
      pixels: ArrayBufferView | null,
    ): void
    texImage2D(
      target: GLenum,
      level: GLint,
      internalformat: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      width: GLsizei,
      height: GLsizei,
      format: GLenum,
      type: GLenum,
      pixels: ArrayBufferView | null,
    ): void
    texSubImage2D(
      target: GLenum,
      level: GLint,
      xoffset: GLint,
      yoffset: GLint,
      format: GLenum,
      type: GLenum,
      source: TexImageSource,
    ): void
    uniform1fv(location: WebGLUniformLocation | null, v: Float32List): void
    uniform1iv(location: WebGLUniformLocation | null, v: Int32List): void
    uniform2fv(location: WebGLUniformLocation | null, v: Float32List): void
    uniform2iv(location: WebGLUniformLocation | null, v: Int32List): void
    uniform3fv(location: WebGLUniformLocation | null, v: Float32List): void
    uniform3iv(location: WebGLUniformLocation | null, v: Int32List): void
    uniform4fv(location: WebGLUniformLocation | null, v: Float32List): void
    uniform4iv(location: WebGLUniformLocation | null, v: Int32List): void
    uniformMatrix2fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      value: Float32List,
    ): void
    uniformMatrix3fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      value: Float32List,
    ): void
    uniformMatrix4fv(
      location: WebGLUniformLocation | null,
      transpose: GLboolean,
      value: Float32List,
    ): void
  }

  interface WebGLSampler {}

  /** The WebGLShader is part of the WebGL API and can either be a vertex or a fragment shader. A WebGLProgram requires both types of shaders. */
  interface WebGLShader {}

  /** Part of the WebGL API and represents the information returned by calling the WebGLRenderingContext.getShaderPrecisionFormat() method. */
  interface WebGLShaderPrecisionFormat {
    readonly precision: GLint
    readonly rangeMax: GLint
    readonly rangeMin: GLint
  }

  interface WebGLSync {}

  /** Part of the WebGL API and represents an opaque texture object providing storage and state for texturing operations. */
  interface WebGLTexture {}

  interface WebGLTransformFeedback {}

  /** Part of the WebGL API and represents the location of a uniform variable in a shader program. */
  interface WebGLUniformLocation {}

  interface WebGLVertexArrayObject {}

  interface WebGLVertexArrayObjectOES {}
}
