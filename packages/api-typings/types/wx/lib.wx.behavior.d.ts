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

declare namespace WechatMiniprogram.Behavior {
  type BehaviorIdentifier<
    TData extends DataOption = {},
    TProperty extends PropertyOption = {},
    TMethod extends MethodOption = {},
    TBehavior extends BehaviorOption = [],
  > = string & {
    [key in 'BehaviorType']?: {
      data: Component.FilterUnknownType<TData> & Component.MixinData<TBehavior>
      properties: Component.FilterUnknownType<TProperty> &
        Component.MixinProperties<TBehavior, true>
      methods: Component.FilterUnknownType<TMethod> &
        Component.MixinMethods<TBehavior>
    }
  }
  type Instance<
    TData extends DataOption,
    TProperty extends PropertyOption,
    TMethod extends MethodOption,
    TBehavior extends BehaviorOption,
    TCustomInstanceProperty extends IAnyObject = Record<string, never>,
  > = Component.Instance<
    TData,
    TProperty,
    TMethod,
    TBehavior,
    TCustomInstanceProperty
  >
  type TrivialInstance = Instance<
    IAnyObject,
    IAnyObject,
    IAnyObject,
    Component.IEmptyArray
  >
  type TrivialOption = Options<
    IAnyObject,
    IAnyObject,
    IAnyObject,
    Component.IEmptyArray
  >
  type Options<
    TData extends DataOption,
    TProperty extends PropertyOption,
    TMethod extends MethodOption,
    TBehavior extends BehaviorOption,
    TCustomInstanceProperty extends IAnyObject = Record<string, never>,
  > = Partial<Data<TData>> &
    Partial<Property<TProperty>> &
    Partial<Method<TMethod>> &
    Partial<Behavior<TBehavior>> &
    Partial<OtherOption> &
    Partial<Lifetimes> &
    ThisType<
      Instance<TData, TProperty, TMethod, TBehavior, TCustomInstanceProperty>
    >
  interface Constructor {
    <
      TData extends DataOption,
      TProperty extends PropertyOption,
      TMethod extends MethodOption,
      TBehavior extends BehaviorOption,
      TCustomInstanceProperty extends IAnyObject = Record<string, never>,
    >(
      options: Options<
        TData,
        TProperty,
        TMethod,
        TBehavior,
        TCustomInstanceProperty
      >,
    ): BehaviorIdentifier<TData, TProperty, TMethod, TBehavior>
  }

  type DataOption = Component.DataOption
  type PropertyOption = Component.PropertyOption
  type MethodOption = Component.MethodOption
  type BehaviorOption = Component.BehaviorOption
  type Data<D extends DataOption> = Component.Data<D>
  type Property<P extends PropertyOption> = Component.Property<P>
  type Method<M extends MethodOption> = Component.Method<M>
  type Behavior<B extends BehaviorOption> = Component.Behavior<B>

  type DefinitionFilter = Component.DefinitionFilter
  type Lifetimes = Component.Lifetimes
  type OtherOption = Omit<Component.OtherOption, 'options'>
}
/** 注册一个 `behavior`，接受一个 `Object` 类型的参数。*/
declare let Behavior: WechatMiniprogram.Behavior.Constructor
