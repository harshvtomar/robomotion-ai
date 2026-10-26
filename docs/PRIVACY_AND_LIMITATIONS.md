# Privacy, safety and simulation limitations

**No physical control:** The website only issues commands to a procedural 3D arm. It has no Arduino, motor controller, serial, USB, BLE or networked actuator integration. The emergency stop is a software interlock for simulation only; it is not a certified industrial safety device.

**Camera control:** Starting the camera requests browser permission. Hand detection uses the local MediaPipe model runtime after downloading WASM/model artifacts from jsDelivr and Google-hosted storage. The application does not intentionally transmit or record webcam frames. Third-party library diagnostic collection has not been independently audited. Use the synthetic gesture bench if camera permission is unavailable; synthetic fixtures cannot actuate the robot.

**Diagnostic export:** Session-only enumerated events (timestamps, event codes, sanitized plain-text details and optional durations) can be exported only by clicking CSV or JSON. They do not include raw landmarks/images/video by schema design. No persistence backend or conversation connector is used. Browser-origin tools and SDKs may have their own logs or network behavior.

**Control accuracy:** All X/Y/Z values are calculated from commanded joint angles. This is not measured end-effector accuracy. Motion interpolation/velocity bounds are discrete approximations. Workspace restrictions, sampled tool/object clearance and occupancy rules are not exhaustive 3D collision detection. The gripper release/grasp algorithm uses proximity and state, not contact force or deformation.

**Accessibility/performance:** Keyboard focus, responsive layout and reduced motion are included in the source. Actual assistive technology, low-power GPU, mobile camera, browser performance and CDN reliability need independent testing. The project must not be described as error-free or independently certified.
