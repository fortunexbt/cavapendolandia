import * as THREE from "three";

export type InputControllerOptions = {
  dom: HTMLElement;
  onLookOffset: (x: number, y: number) => void;
  onPointerTap: (pointerNdc: THREE.Vector2) => void;
  onPointerMoveNdc?: (pointerNdc: THREE.Vector2) => void;
  onPointerExit?: () => void;
};

export class InputController {
  private dom: HTMLElement;

  private onLookOffset: (x: number, y: number) => void;

  private onPointerTap: (pointerNdc: THREE.Vector2) => void;

  private onPointerMoveNdc?: (pointerNdc: THREE.Vector2) => void;

  private onPointerExit?: () => void;

  private pointer = new THREE.Vector2(0, 0);

  constructor(options: InputControllerOptions) {
    this.dom = options.dom;
    this.onLookOffset = options.onLookOffset;
    this.onPointerTap = options.onPointerTap;
    this.onPointerMoveNdc = options.onPointerMoveNdc;
    this.onPointerExit = options.onPointerExit;

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);

    this.dom.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.dom.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    this.dom.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
  }

  private resolveNdc(clientX: number, clientY: number) {
    const rect = this.dom.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return new THREE.Vector2(x * 2 - 1, -(y * 2 - 1));
  }

  private onPointerMove(event: PointerEvent) {
    const ndc = this.resolveNdc(event.clientX, event.clientY);
    if (!ndc) return;
    this.pointer.copy(ndc);
    this.onLookOffset(ndc.x, ndc.y);
    this.onPointerMoveNdc?.(this.pointer.clone());
  }

  private onPointerDown(event: PointerEvent) {
    const ndc = this.resolveNdc(event.clientX, event.clientY);
    if (!ndc) return;
    this.pointer.copy(ndc);
    this.onPointerTap(this.pointer.clone());
  }

  private onPointerLeave() {
    this.onPointerExit?.();
  }

  dispose() {
    this.dom.removeEventListener("pointermove", this.onPointerMove);
    this.dom.removeEventListener("pointerdown", this.onPointerDown);
    this.dom.removeEventListener("pointerleave", this.onPointerLeave);
  }
}
