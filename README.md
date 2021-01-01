# Average-Precision Orbit Propagator
A mission design tool based on P5.js and THREE.js. At its core, the application simulates (semi-faithfully) the Earth-Moon system with a user-controlled satellite. All features have been implemented by hand, including the integrator, interpolator, visualization, and mission control sequence architecture. The name is a play on STK's High-Precision Orbit Propagator. This tool is capable of targeting over a dozen quantities in the Earth or Moon ecliptic reference frames. The goal of this tool is to provide an interactive and intuitive introduction to orbital mechanics while still providing relatively advanced and precise targeting capabilities. Unique(ish) to this tool is its default to live-propagation and user control. When no mission control sequence is provided or the sequence has finished, control is returned to the user. This allows users to get comfortable with VNB burns or to execute their own missions with the help of the built-in time control system.

### Integrator
Currently, the only implemented integrator is [Runge-Kutta-Fehlberg 4(5)](https://en.wikipedia.org/wiki/Runge–Kutta–Fehlberg_method). Stepsize variation is currently not enabled by default as the quadratic spline interpolator I'm using is prohibitively slow compared to just integrating with a smaller step.

### Targeting
I'm using a basic Newton-Raphson root-finding algorithm for differential correction. Some quantities require a more damped approach. For example, targeting a large apoapsis where eccentricity approaches 1, which can lead to an 'undamped' root-finder jumping into undefined/infinite apoapsis land and failing. In these cases, the user can input a 'sensitivity' value to control how quickly a convergence is found. In the future I'd like to implement a better solution for this problem involving a variable sensitivity optimized by an embedded Newton-Raphson process.

### Perturbations
3rd-body perturbations due to the Moon as well as J2 perturbations due to the Earth's oblateness are implemented using Crowell's method. Note that targeting some quantities from circular LEO (like INC = 0) gets difficult with J2 enabled.

### Mission Control Sequence (MCS)
Within the `Mission` object, the user can define a mission control sequence. This represents a sequence of functions executed by the vehicle in order. In general, this will consist of `propTo___` and `TargetQuantity` calls. Currently, the user can target the following quantities for any central body:
- True Anomaly (&theta;)
- Eccentricity (<i>e</i>)
- Semi-major Axis (<i>a</i>)
- Inclination (<i>i</i>)
- RMAG
- VMAG
- Period
- Radius of Apoapsis
- Radius of Periapsis
- Parameter (<i>p</i>)
- Specific Angular Momentum
- Specific Mechanical Energy

With burn axes:
- Velocity
- Normal
- Binormal
- Pure inclination change

This application also comes with builtin propagation functions, including:
- `propToApoapsis`
- `propToPeriapsis`
- `propToAscendingNode`
- `propToDescendingNode`
- `propToTheta`
- `propToRMAG`

Note that for consistency, all of these functions are really wrappers on `propToTheta`. For example, `propToApoapsis` is really just a propagation to &theta; = 2&pi;.

### Initial Conditions
I've been using an initial set of state vectors from the ISS for development. I plan on eventually implementing a variety of presets for different orbit types, as well as an orbit wizard for more specific design.

### Ground Track Plotting
The tool defaults to plotting satellite ground tracks at all times.

### Keyboard Controls
- `ENTER` unpauses time or advances to the next segment of the MCS
- `ESC` pauses time but cannot pause the execution of the MCS
- '>' burns in the positive sense of the selected burn axis
- '<' burns in the negative sense of the selected burn axis

## Future Plans
- [ ] Future state targeting (an analog of GMAT's target -> vary -> execute maneuver -> propagate)
- [ ] Targeting with multiple control variables and equality conditions
- [ ] Additional control variables including arbitrary/user-provided burn axes
- [ ] Initial state entry mode
- [ ] Mission reset button
- [ ] More detailed mission execution/differential corrector activity
- [ ] Future trajectory length slider
- [ ] Monospaced font for all numerical views
- [ ] State variables view
- [ ] Highlighted labels for Moon, Earth, Sun, and Sat
- [ ] Additional Runge-Kutta family numerical integrators with the ability to switch at will
- [ ] A more robust implementation of coordinate frames and transformations
- [ ] Enabling variable step error control, requiring an overhaul of the `animator` class
- [ ] Add canned example missions (Hohmann, Bielliptic, GTO, etc.)
