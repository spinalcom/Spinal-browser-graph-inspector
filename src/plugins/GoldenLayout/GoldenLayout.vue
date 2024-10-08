<!--
Copyright 2024 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->
<template>
  <div style="position: relative">
    <SlotExtr ref="predef"> </SlotExtr>
    <div ref="GLRoot" style="position: absolute; width: 100%; height: 100%">
      <!-- Root dom for Golden-Layout manager -->
    </div>
    <div style="position: absolute; width: 100%; height: 100%">
      <gl-template
        v-for="pair in AllComponents"
        :key="pair[0]"
        :ref="GlcKeyPrefix + pair[0]"
      >
        <component :is="pair[1]"></component>
      </gl-template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
  readonly,
  nextTick,
  getCurrentInstance,
  provide,
  type PropType,
  type Slots,
} from "vue";
import {
  ComponentContainer,
  type Json,
  LayoutConfig,
  RowOrColumnItemConfig,
  type StackItemConfig,
  ComponentItemConfig,
  ResolvedComponentItemConfig,
  LogicalZIndex,
  VirtualLayout,
  ResolvedLayoutConfig,
  JsonValue,
} from "golden-layout";
import GlTemplate from "./GlTemplate.vue";
import { layoutKey } from "./consts";
import SlotExtr from "./utils/SlotExtr.vue";

type AnyItemConfigs =
  | RowOrColumnItemConfig[]
  | StackItemConfig[]
  | ComponentItemConfig[];

/*******************
 * Prop
 *******************/
const props = defineProps({
  config: {
    type: Object as PropType<LayoutConfig | ResolvedLayoutConfig>,
    default: () => ({}),
  },
});
/*******************
 * Data
 *******************/
const GLRoot = ref<null | HTMLElement>(null);
const GlcKeyPrefix = readonly(ref("glc_"));
const MapComponents = new Map<
  ComponentContainer,
  { refId: number; glc: typeof GlTemplate }
>();
const AllComponents = ref(new Map<number, any>());
const UnusedIndexes: number[] = [];
const instance = getCurrentInstance();
const slots = instance!.slots;
const predef = ref<typeof SlotExtr>();
const routeChildren = <Record<string, number>>{};
let GLayout: VirtualLayout;

let CurIndex = 0;
let GlBoundingClientRect: DOMRect;
provide(layoutKey, instance?.exposed);
/*******************
 * Method
 *******************/
/** @internal */
const addComponent = async (
  componentType: string,
  componentState: JsonValue | undefined
) => {
  const glc =
    slots[componentType] || (<Slots>predef.value?.slots)[componentType];
  if (!glc)
    throw new Error(
      `addComponent: Component '${componentType}' not found in slots`
    );
  let index = CurIndex;
  if (UnusedIndexes.length > 0) index = UnusedIndexes.pop() as number;
  else CurIndex++;
  AllComponents.value.set(index, () => glc(componentState));

  return index;
};

const addGlComponent = async (
  componentType: string,
  title: string,
  componentState: JsonValue | undefined = undefined
) => {
  if (componentType.length == 0)
    throw new Error("addGlComponent: Component's type is empty");

  const index = await addComponent(componentType, componentState);

  await nextTick(); // wait 1 tick for vue to add the dom

  GLayout.addComponent(
    componentType,
    { refId: index, ...((componentState as object) || {}) },
    title
  );
};

const loadGLLayout = async (
  layoutConfig: LayoutConfig | ResolvedLayoutConfig
) => {
  GLayout.clear();
  AllComponents.value.clear();

  const config = (
    (layoutConfig as ResolvedLayoutConfig).resolved
      ? LayoutConfig.fromResolved(layoutConfig as ResolvedLayoutConfig)
      : layoutConfig
  ) as LayoutConfig;

  let contents: AnyItemConfigs[] = [config.root!.content as AnyItemConfigs];

  let index = 0;
  while (contents.length > 0) {
    const content = contents.shift() as AnyItemConfigs;
    for (let itemConfig of content) {
      if (itemConfig.type == "component") {
        index = await addComponent(
          itemConfig.componentType as string,
          itemConfig.componentState
        );
        if (typeof itemConfig.componentState == "object")
          (itemConfig.componentState as Json)!.refId = index;
        else itemConfig.componentState = { refId: index };
      } else if (itemConfig.content.length > 0) {
        contents.push(itemConfig.content as AnyItemConfigs);
      }
    }
  }
  await nextTick(); // wait 1 tick for vue to add the dom
  GLayout.loadLayout(config);
};

const getLayoutConfig = () => {
  return GLayout.saveLayout();
};

/*******************
 * Mount
 *******************/
onMounted(() => {
  if (GLRoot.value == null)
    throw new Error("Golden Layout can't find the root DOM!");

  const onResize = () => {
    const dom = GLRoot.value;
    let width = dom ? dom.offsetWidth : 0;
    let height = dom ? dom.offsetHeight : 0;
    GLayout.setSize(width, height);
  };

  window.addEventListener("resize", onResize, { passive: true });

  const handleBeforeVirtualRectingEvent = (count: number) => {
    GlBoundingClientRect = (
      GLRoot.value as HTMLElement
    ).getBoundingClientRect();
  };

  const handleContainerVirtualRectingRequiredEvent = (
    container: ComponentContainer,
    width: number,
    height: number
  ): void => {
    const component = MapComponents.get(container);
    if (!component || !component?.glc) {
      throw new Error(
        "handleContainerVirtualRectingRequiredEvent: Component not found"
      );
    }

    const containerBoundingClientRect =
      container.element.getBoundingClientRect();
    const left = containerBoundingClientRect.left - GlBoundingClientRect.left;
    const top = containerBoundingClientRect.top - GlBoundingClientRect.top;
    component.glc.setPosAndSize(left, top, width, height);
  };

  const handleContainerVirtualVisibilityChangeRequiredEvent = (
    container: ComponentContainer,
    visible: boolean
  ): void => {
    const component = MapComponents.get(container);
    if (!component || !component?.glc) {
      throw new Error(
        "handleContainerVirtualVisibilityChangeRequiredEvent: Component not found"
      );
    }

    component.glc.setVisibility(visible);
  };

  const handleContainerVirtualZIndexChangeRequiredEvent = (
    container: ComponentContainer,
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void => {
    const component = MapComponents.get(container);
    if (!component || !component?.glc) {
      throw new Error(
        "handleContainerVirtualZIndexChangeRequiredEvent: Component not found"
      );
    }

    component.glc.setZIndex(defaultZIndex);
  };

  const bindComponentEventListener = (
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ): ComponentContainer.BindableComponent => {
    let refId = -1;
    if (itemConfig && itemConfig.componentState) {
      refId = (itemConfig.componentState as Json).refId as number;
    } else {
      throw new Error(
        "bindComponentEventListener: component's ref id is required"
      );
    }

    const ref = GlcKeyPrefix.value + refId;
    const component = instance?.refs[ref] as typeof GlTemplate;

    MapComponents.set(container, { refId, glc: component[0] });

    container.virtualRectingRequiredEvent = (container, width, height) =>
      handleContainerVirtualRectingRequiredEvent(container, width, height);

    container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
      handleContainerVirtualVisibilityChangeRequiredEvent(container, visible);

    container.virtualZIndexChangeRequiredEvent = (
      container,
      logicalZIndex,
      defaultZIndex
    ) =>
      handleContainerVirtualZIndexChangeRequiredEvent(
        container,
        logicalZIndex,
        defaultZIndex
      );
    return {
      component,
      virtual: true,
    };
  };

  const unbindComponentEventListener = (
    container: ComponentContainer
  ): void => {
    const component = MapComponents.get(container);
    if (!component || !component?.glc) {
      throw new Error("handleUnbindComponentEvent: Component not found");
    }

    MapComponents.delete(container);
    AllComponents.value.delete(component.refId);
    UnusedIndexes.push(component.refId);
    Object.entries(routeChildren).find(([key, value]) => {
      if (value === component.refId) {
        delete routeChildren[key];
        return true;
      }
      return false;
    });
  };

  GLayout = new VirtualLayout(
    GLRoot.value as HTMLElement,
    bindComponentEventListener,
    unbindComponentEventListener
  );

  GLayout.beforeVirtualRectingEvent = handleBeforeVirtualRectingEvent;
  if (props.config) loadGLLayout(props.config);
});

const components = ref<Record<string, any>>({});

/*******************
 * Expose
 *******************/
defineExpose({
  addGlComponent,
  loadGLLayout,
  getLayoutConfig,
});
</script>
