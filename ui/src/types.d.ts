declare module "*.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "react-dnd-mouse-backend" {
  const MouseBackEnd: import("dnd-core").BackendFactory;
  export default MouseBackEnd;
}
