/*! *****************************************************************************
Copyright (c) 2024 Tencent, Inc. All rights reserved.

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

/** [WXWebAssembly](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/wasm.html)
 *
 * WXWebAssembly */
declare namespace WXWebAssembly {
  type BufferSource = ArrayBufferView | ArrayBuffer

  type CompileError = Error

  const CompileError: {
    prototype: CompileError
    new (message?: string): CompileError
    (message?: string): CompileError
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance) */
  interface Instance {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance/exports) */
    readonly exports: Exports
  }

  const Instance: {
    prototype: Instance
    new (module: Module, importObject?: Imports): Instance
  }

  type LinkError = Error

  const LinkError: {
    prototype: LinkError
    new (message?: string): LinkError
    (message?: string): LinkError
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory) */
  interface Memory {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory/buffer) */
    readonly buffer: ArrayBuffer
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory/grow) */
    grow(delta: number): number
  }

  const Memory: {
    prototype: Memory
    new (descriptor: MemoryDescriptor): Memory
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module) */
  interface Module {}

  const Module: {
    prototype: Module
    new (bytes: BufferSource): Module
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module/customSections) */
    customSections(moduleObject: Module, sectionName: string): ArrayBuffer[]
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module/exports) */
    exports(moduleObject: Module): ModuleExportDescriptor[]
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module/imports) */
    imports(moduleObject: Module): ModuleImportDescriptor[]
  }

  interface RuntimeError extends Error {}

  const RuntimeError: {
    prototype: RuntimeError
    new (message?: string): RuntimeError
    (message?: string): RuntimeError
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Table) */
  interface Table {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Table/length) */
    readonly length: number
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Table/get) */
    get(index: number): any
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Table/grow) */
    grow(delta: number, value?: any): number
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Table/set) */
    set(index: number, value?: any): void
  }

  const Table: {
    prototype: Table
    new (descriptor: TableDescriptor, value?: any): Table
  }

  interface MemoryDescriptor {
    initial: number
    maximum?: number
    shared?: boolean
  }

  interface ModuleExportDescriptor {
    kind: ImportExportKind
    name: string
  }

  interface ModuleImportDescriptor {
    kind: ImportExportKind
    module: string
    name: string
  }

  interface TableDescriptor {
    element: TableKind
    initial: number
    maximum?: number
  }

  type ImportExportKind = 'function' | 'global' | 'memory' | 'table'
  type TableKind = 'anyfunc' | 'externref'
  type ValueType =
    | 'anyfunc'
    | 'externref'
    | 'f32'
    | 'f64'
    | 'i32'
    | 'i64'
    | 'v128'
  // eslint-disable-next-line @typescript-eslint/ban-types
  type ExportValue = Function | Memory | Table
  type Exports = Record<string, ExportValue>
  type ImportValue = ExportValue | number
  type Imports = Record<string, ModuleImports>
  type ModuleImports = Record<string, ImportValue>
  /** [WXWebAssembly](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/wasm.html) */
  function instantiate(path: string, importObject?: Imports): Promise<Instance>
}
