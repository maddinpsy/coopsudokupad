var FeaturePuzzleEvents = (() => {
	
	// Triggers
		const PuzzleTriggerThreeInTheCorner = (() => {
			function PuzzleTriggerThreeInTheCorner() {
				bindHandlers(this);
				this.queue = [];
				this.timeoutId = undefined;
			}
			const C = PuzzleTriggerThreeInTheCorner, P = Object.assign(C.prototype, {constructor: C});
			C.triggerTimeout = 1000;
			C.cornerRCs = ['r1c1', 'r1c9', 'r9c1', 'r9c9'];
			P.isCellThreeInTheCorner = function(cell) {
				return cell.propGet('normal') === '3' && C.cornerRCs.includes(cell.toRC());
			};
			P.handleTrigger = function() { throw new Error('handleTrigger not assigned'); };
			P.handleInit = function(handleTrigger) { this.handleTrigger = handleTrigger; };
			P.handleLoad = function() {
				let {app: {puzzle}} = Framework;
				let [min, max] = puzzle.getMinMaxRC();
				C.cornerRCs = [
					`r${min[0]+1}c${min[1]+1}`,
					`r${min[0]+1}c${max[1]+1}`,
					`r${max[0]+1}c${min[1]+1}`,
					`r${max[0]+1}c${max[1]+1}`,
				];
			};
			P.handleTimeout = function() {
				const now = Date.now();
				const {triggerTimeout} = C;
				let {queue, timeoutId, handleTimeout} = this;
				this.timeoutId = undefined;
				queue.forEach(([cell, time]) => {
					let dt = now - time;
					if(this.isCellThreeInTheCorner(cell) && dt >= triggerTimeout) {
						let bounds = cell.elem.getBoundingClientRect();
						this.handleTrigger(this, {
							x: bounds.x + 0.5 * bounds.width,
							y: bounds.y + 0.5 * bounds.height
						});
					}
				});
				this.queue = queue = queue.filter(([cell, time]) => now - time < triggerTimeout);
				if(queue.length > 0) {
					let timeToNext = triggerTimeout - (now - queue[0][1]);
					this.timeoutId = setTimeout(this.handleTimeout, timeToNext);
				}
			};
			P.handleAct = function(action) {
				if(!['value', 'clear'].includes(action.type)) return;
				let {app, app: {puzzle, puzzle: {selectedCells}}} = Framework;
				let {queue, timeoutId, triggerTimeout, handleTimeout} = this;
				this.queue = queue = queue.filter(([cell, time]) => cell.propGet('normal') === '3');
				if(action.type === 'value' && action.arg === '3') {
					let haveThree = selectedCells
						.filter(this.isCellThreeInTheCorner)
						.filter(cell => !queue.find(([c, t]) => c === cell));
					if(haveThree.length > 0) {
						let time = Date.now();
						queue.push(...haveThree.map(cell => [cell, time]));
						if(timeoutId === undefined) this.timeoutId = setTimeout(handleTimeout, triggerTimeout);
					}
				}
			};
			return C;
		})();
		const PuzzleTriggerBDaySpecial = (() => {
			function PuzzleTriggerBDaySpecial() {
				bindHandlers(this);
				this.queue = [];
				this.timeoutId = undefined;
				this.enabled = false;
				this.isOnCooldown = false;
				this.cooldownTimeoutId;
			}
			const C = PuzzleTriggerBDaySpecial, P = Object.assign(C.prototype, {constructor: C});
			C.triggerTimeout = 1000;
			C.triggerCooldown = 5000;
			C.cornerRCs = ['r1c1', 'r1c9', 'r9c1', 'r9c9'];
			C.triggerSolutionDigest = 'caf35df6910c44dc38f15b89599e0cfc';
			P.isCellThreeInTheCorner = function(cell) {
				return cell.propGet('normal') === '3' && C.cornerRCs.includes(cell.toRC());
			};
			P.handleTrigger = function() { throw new Error('handleTrigger not assigned'); };
			P.handleInit = function(handleTrigger) { this.handleTrigger = handleTrigger; };
			P.handleLoad = function() {
				let {app: {puzzle, currentPuzzle: {cages, solution = ''}}} = Framework;
				let [min, max] = puzzle.getMinMaxRC();
				C.cornerRCs = [
					`r${min[0]+1}c${min[1]+1}`,
					`r${min[0]+1}c${max[1]+1}`,
					`r${max[0]+1}c${min[1]+1}`,
					`r${max[0]+1}c${max[1]+1}`,
				];
				if(C.triggerSolutionDigest === md5Digest(solution)) this.enabled = true;
			};
			P.handleCooldownTimeout = function() {
				clearTimeout(this.cooldownTimeoutId);
				this.isOnCooldown = false;
			};
			P.startCooldown = function() {
				clearTimeout(this.cooldownTimeoutId);
				this.cooldownTimeoutId = setTimeout(this.handleCooldownTimeout, C.triggerCooldown);
				this.isOnCooldown = true;
			};
			P.handleTimeout = function() {
				const now = Date.now();
				const {triggerTimeout} = C;
				let {queue, timeoutId, handleTimeout} = this;
				this.timeoutId = undefined;
				if(!this.isOnCooldown) {
					queue.forEach(([cell, time]) => {
						let dt = now - time;
						if(this.isCellThreeInTheCorner(cell) && dt >= triggerTimeout) {
							let bounds = cell.elem.getBoundingClientRect();
							this.handleTrigger(this, {
								x: bounds.x + 0.5 * bounds.width,
								y: bounds.y + 0.5 * bounds.height
							});
							this.startCooldown();
						}
					});
				}
				this.queue = queue = queue.filter(([cell, time]) => now - time < triggerTimeout);
				if(queue.length > 0) {
					let timeToNext = triggerTimeout - (now - queue[0][1]);
					this.timeoutId = setTimeout(this.handleTimeout, timeToNext);
				}
			};
			P.handleAct = function(action) {
				if(!this.enabled) return;
				if(!['value', 'clear'].includes(action.type)) return;
				let {app, app: {currentPuzzle: {solution = ''}, puzzle, puzzle: {selectedCells}}} = Framework;
				let {queue, timeoutId, triggerTimeout, handleTimeout} = this;
				this.queue = queue = queue.filter(([cell, time]) => cell.propGet('normal') === '3');
				if(action.type === 'value' && action.arg === '3') {
					let haveThree = selectedCells
						.filter(this.isCellThreeInTheCorner)
						.filter(cell => !queue.find(([c, t]) => c === cell));
					if(haveThree.length > 0) {
						let time = Date.now();
						queue.push(...haveThree.map(cell => [cell, time]));
						if(timeoutId === undefined) this.timeoutId = setTimeout(handleTimeout, triggerTimeout);
					}
				}
			};
			return C;
		})();
	
	// Effects
		const EffectConfetti = (() => {
			function EffectConfetti(config) {
				this.config = Object.assign({}, C.DefaultConfig, config);
			}
			const C = EffectConfetti, P = Object.assign(C.prototype, {constructor: C});
			C.DefaultConfig = {
				colors: ['#EF2964', '#00C09D', '#2D87B0', '#48485E','#EFFF1D'],
				anims: ['slow', 'medium', 'fast'],
				size: 10,
				interval: 16, timeout: 3000,
				posJitter: 0, angJitter: 0, distJitter: 0, sizeJitter: 0,
			};
			C.getJitter = jitter => Math.round((Math.random() - 0.5) * jitter);
			C.getAngDist = ([x0, y0], [x1, y1]) => {
				let dx = x0 - x1, dy = y0 - y1;
				return [
					Math.atan2(dy, dx) * 180 / Math.PI + 90,
					Math.round(Math.sqrt(dx * dx + dy * dy))
				];
			};
			P.fireConfetti = function(from, to) {
				const {parent, colors, anims, timeout, posJitter, angJitter, distJitter, size, sizeJitter} = this.config;
				let x = from[0] + C.getJitter(posJitter), y = from[1] + C.getJitter(posJitter),
						dx = x - to[0], dy = y - to[1],
						anim = anims[Math.floor(Math.random() * anims.length)],
						color = colors[Math.floor(Math.random() * colors.length)],
						[ang, dist] = C.getAngDist(from, to),
						confSize = size + C.getJitter(sizeJitter);
				ang += C.getJitter(angJitter);
				dist += C.getJitter(distJitter);
				let elem = document.createElement('div');
				elem.classList.add(`confetti`, `confetti--animation-${anim}`);
				Object.assign(elem.style, {width: `${dist}px`, height: `${size}px`, left: `${x}px`, top: `${y}px`, transform: `rotate(${ang}deg)`});
				elem.style.setProperty('--confetti-color', color);
				setTimeout(() => elem.remove(), timeout);
				parent.appendChild(elem);
				return elem;
			};
			P.blastConfetti = function(from, to, duration = 500) {
				const {interval} = this.config;
				let intervalId = setInterval(this.fireConfetti.bind(this, from, to), interval);
				setTimeout(() => clearInterval(intervalId), duration);
			};
			P.startConfettiGun = function(from, to) {
				const {interval} = this.config;
				clearInterval(this.confettiGunId);
				this.confettiGunId = setInterval(this.fireConfetti.bind(this, from, to), interval);
			};
			P.stopConfettiGun = function() {
				clearInterval(this.confettiGunId);
				delete this.confettiGunId;
			};
			return C;
		})();
		const PuzzleEffectConfetti = (() => {
			function PuzzleEffectConfetti() {
				bindHandlers(this);
				this.confettiRunning = false;
				this.confetti = new EffectConfetti({
					interval: 16, size: 10,
					angJitter: 30, sizeJitter: 20, distJitter: 20, posJitter: 10,
				});
			}
			const C = PuzzleEffectConfetti, P = Object.assign(C.prototype, {constructor: C});
			P.handleRemoveConfettiContainer = function() {
				if(this.confettiRunning || this.containerEl === undefined) return;
				this.containerEl.remove();
				delete this.containerEl;
				this.confettiRunning = false;
			};
			P.trigger = function(pos) {
				if(this.containerEl === undefined) {
					const containerEl = document.createElement('div');
					containerEl.classList.add('confetti-container');
					document.body.appendChild(containerEl);
					this.containerEl = containerEl;
					this.confetti.config.parent = this.containerEl;
					this.confetti.config.timeout = 3000;
				}
				this.confettiRunning = true;
				let bb = bounds(Framework.app.svgRenderer.svgElem),
						from = [pos.x, pos.y],
						to =   [Math.round(bb.left + 0.5 * bb.width), Math.round(bb.top + 0.5 * bb.height)];
				this.confetti.blastConfetti(from, to, 1500);
				clearTimeout(this.confettiTimeoutId);
				this.confettiTimeoutId = setTimeout(this.handleRemoveConfettiContainer, 3000);
			};
			return C;
		})();
		const PuzzleEffectDeetDeetDoot = (() => {
			function PuzzleEffectDeetDeetDoot() {
				bindHandlers(this);
			}
			const C = PuzzleEffectDeetDeetDoot, P = Object.assign(C.prototype, {constructor: C});
			C.html = `<div class="deetdeetdoot">
				<div class="keys"></div>
				<div class="notes">
					<div class="deet1"><span class="slide"><span class="flip">Deet</span></span></div>
					<div class="deet2"><span class="slide"><span class="flip">Deet</span></span></div>
					<div class="doot"><span class="slide"><span class="flip">Doot</span></span></div>
				</div>
			</div>`;
			P.handleRemoveContainer = function() {
				if(this.containerEl === undefined) return;
				this.containerEl.remove();
				delete this.containerEl;
			};
			P.trigger = function(pos) {
				const {createElem} = Framework;
				if(this.containerEl === undefined) {
					this.containerEl = createElem({parent: document.body});
				}
				let bb = bounds(Framework.app.svgRenderer.svgElem),
						from = [pos.x, pos.y],
						to =   [Math.round(bb.left + 0.5 * bb.width), Math.round(bb.top + 0.5 * bb.height)];
				let dx = from[0] - to[0], dy = from[1] - to[1];
				let ang = Math.round(Math.atan2(dy, dx) * 180 / Math.PI + 135);
				this.containerEl.insertAdjacentHTML('beforeend', C.html);
				let el = this.containerEl.lastChild;
				el.style.left = `${Math.round(pos.x)}px`;
				el.style.top = `${Math.round(pos.y)}px`;
				el.style.transform = `rotate(${ang}deg`;
				if(ang > 45 && ang < 270) el.classList.add('flipped');
				clearTimeout(this.containerTimeoutId);
				this.containerTimeoutId = setTimeout(this.handleRemoveContainer, 3000);
			};
			return C;
		})();

	const FeaturePuzzleEvents = (() => {
		function FeaturePuzzleEvents() {
			bindHandlers(this);
			this.featureEnabled = false;
			this.triggers = {};
			this.effects = {};
			this.triggerEffects = {};
		}
		const C = FeaturePuzzleEvents, P = Object.assign(C.prototype, {constructor: C});
		C.SettingName = 'puzzleevents';
		C.FeatureSettings = {
			off: {value: false, label: 'Off', alt: [false , 'off']},
			confetti: {value: 'confetti', label: 'Confetti'},
			deetdeetdoot: {value: 'deetdeetdoot', label: 'Deet Deet Doot'},
		};
		C.SettingDefault = 'confetti';
		C.featureStyle = `
			.confetti-container {
				perspective: 700px;
				position: absolute;
				overflow: hidden;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				user-select: none;
				pointer-events: none;
				-webkit-transform: translate3d(0, 0, 0);
				transform: translate3d(0, 0, 0);
				perspective: 1000;
				-webkit-perspective: 1000;
				backface-visibility: hidden;
				-webkit-backface-visibility: hidden;
			}
			.confetti {
				position: absolute;
				--confetti-color: magenta;
				transform-origin: top left;
			}
			.confetti::before {
				content: "";
				display: block;
				height: 100%;
				aspect-ratio: 1 / 1;
				background-color: var(--confetti-color);
				transform-origin: center;
			}
			@keyframes confetti-slow {
				0% { margin-top: 0; transform: translate3d(0, 0, 0) rotateX(0) rotateY(0) scale(1, 1); opacity: 1; }
				100% { margin-top: 105%; transform: translate3d(0, 0, 0) rotateX(360deg) rotateY(180deg) scale(1.5, 1.5); opacity: 0; }
			}
			@keyframes confetti-medium {
				0% { margin-top: 0; transform: translate3d(0, 0, 0) rotateX(0) rotateY(0) scale(1, 1); opacity: 1; }
				100% { margin-top: 105%; transform: translate3d(0, 0, 0) rotateX(100deg) rotateY(360deg) scale(1.3, 1.3); opacity: 0; }
			}
			@keyframes confetti-fast {
				0% { margin-top: 0; transform: translate3d(0, 0, 0) rotateX(0) rotateY(0) scale(0.8, 0.8); opacity: 1; }
				100% { margin-top: 105%; transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(250deg) scale(1.2, 1.2); opacity: 0; }
			}
			.confetti--animation-slow::before { animation: confetti-slow 2.25s ease-out 1 forwards; }
			.confetti--animation-medium::before { animation: confetti-medium 1.75s ease-out 1 forwards; }
			.confetti--animation-fast::before { animation: confetti-fast 1.25s ease-out 1 forwards; }

			.deetdeetdoot {
				position: absolute;
				width: 128px; height: 128px;
				transform-origin: top left;
				transform: scale(1.3);
				--rotatey: -10deg;
				--transFrom: 0%;
				--transTo: 50%;
				--rotatez-deet1: 15deg;
				--rotatez-deet2: 45deg;
				--rotatez-doot : 75deg;
			}
			.deetdeetdoot * { display: block; position: absolute;  }
			.deetdeetdoot .keys {
				font-size: 32px;
				transform-origin: center center;
				left: -30%; top: -30%;
				transform: rotate(-45deg);
				width: 36px; height: 36px;
				background: no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAAHlBMVEVHcEwxNz0xNz0xNz0xNz0xNz3h6O0xNz2Um6B+hIpZaSqLAAAABnRSTlMAcO/fYIAX+Cy6AAAAZElEQVRIx2NgVC8nAIoCGNzLCYJCBnPCiooZyokAw15RGhBAOFgZaaOKRhWNKhpVNKqIDEXTQSKVWBkIRSBmGg7GqKJRRYNYURuIlQGlMRkZxDZD1IlprokTVlTCwEKw5VckAADbD2ztv9+oVAAAAABJRU5ErkJggg==);
				background-size: 36px 36px;
			}
			.deetdeetdoot .notes { width: 100%; height: 100%; perspective-origin: 0 0; }
			.deetdeetdoot .notes * { width: 100%; }
			.deetdeetdoot .notes div {
				font-size: 48px;
				height: 1.5rem; line-height: 1.5rem;
				margin-top: -0.75rem;
				left: -30%; top: -30%;
				perspective: 20px;
				transform-origin: center left;
			}
			.deetdeetdoot .notes .slide { transform-origin: center right; animation: 1.2s ease-out 0s 2 forwards; }
			.deetdeetdoot .keys { animation: 2.4s ease-out 0s 1 forwards; }
			.deetdeetdoot .deet1 { transform: rotateZ(var(--rotatez-deet1)); }
			.deetdeetdoot .deet2 { transform: rotateZ(var(--rotatez-deet2)); }
			.deetdeetdoot .doot  { transform: rotateZ(var(--rotatez-doot )); }
			.deetdeetdoot.flipped .flip { transform: scale(-1, -1); }
			@keyframes deetdeetdoot-keys {
				  0% { opacity: 1.0; }
				 95% { opacity: 1.0; }
				100% { opacity: 0.0; }
			}
			@keyframes deetdeetdoot-deet1 {
					      0% { transform: rotateY(var(--rotatey)) translate(var(--transFrom), 0%); opacity: 0.3; }
				 20%,  40% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 1.0; }
				 60%, 100% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 0.0; }
			}
			@keyframes deetdeetdoot-deet2 {
				  0%,  19% { transform: rotateY(var(--rotatey)) translate(var(--transFrom), 0%); opacity: 0.0; }
				       20% { transform: rotateY(var(--rotatey)) translate(var(--transFrom), 0%); opacity: 0.3; }
				 40%,  60% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 1.0; }
				 80%, 100% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 0.0; }
			}
			@keyframes deetdeetdoot-doot  {
				  0%,  39% { transform: rotateY(var(--rotatey)) translate(var(--transFrom), 0%); opacity: 0.0; }
				       40% { transform: rotateY(var(--rotatey)) translate(var(--transFrom), 0%); opacity: 0.3; }
				 60%,  80% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 1.0; }
				      100% { transform: rotateY(var(--rotatey)) translate(var(--transTo), 0%); opacity: 0.0; }
			}
			.deetdeetdoot .keys  { animation-name: deetdeetdoot-keys; }
			.deetdeetdoot .deet1 .slide { animation-name: deetdeetdoot-deet1; }
			.deetdeetdoot .deet2 .slide { animation-name: deetdeetdoot-deet2; }
			.deetdeetdoot .doot  .slide { animation-name: deetdeetdoot-doot; }
		`;
		P.triggerEvent = function(eventName, args, triggers) {
			if(args === undefined) args = [];
			if(!Array.isArray(args)) args = [args];
			if(triggers === undefined) triggers = Object.values(this.triggers);
			if(!Array.isArray(triggers)) triggers = [triggers];
			let handlerName = `handle${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
			triggers.forEach(trigger => trigger[handlerName] ? trigger[handlerName](...args) : null);
		};
		P.addTrigger = function(name, trigger) {
			this.triggers[name] = trigger;
			this.triggerEvent('init', this.handleTrigger, trigger);
		};
		P.addEffect = function(name, effect) {
			this.effects[name] = effect;
		};
		P.getTriggerEffects = function(triggerName) {
			return this.triggerEffects[triggerName] = this.triggerEffects[triggerName] || [];
		};
		P.addTriggerEffect = function(triggerName, effectName) {
			this.getTriggerEffects(triggerName).push(effectName);
		};
		P.handleTrigger = function(trigger, ...args) {
			let triggerName = (Object.entries(this.triggers).find(([name, tr]) => trigger === tr) || [])[0];
			(this.triggerEffects[triggerName] || []).forEach(effect => this.effects[effect].trigger(...args));
		};
		P.handleAct = function(action) {
			this.triggerEvent('act', action);
		};
		P.handleLoad = function() {
			this.triggerEvent('load');
		};
		P.handleStart = function() {
			this.triggerEvent('start');
		};
		P.attachElem = async function() {
			let {app, app: {puzzle}} = Framework;
			if(app === undefined) return;
			if(this.featureEnabled) return;
			this.featureEnabled = true;
			app.on('act', this.handleAct);
			puzzle.on('start', this.handleStart);
			puzzle.on('progressloaded', this.handleLoad);
			this.featureStylesheet = await attachStylesheet(C.featureStyle);
		};
		P.detachElem = function() {
			let {app, app: {puzzle}} = Framework;
			if(app === undefined) return;
			if(!this.featureEnabled) return;
			this.featureEnabled = false;
			app.off('act', this.handleAct);
			puzzle.off('start', this.handleStart);
			puzzle.off('progressloaded', this.handleLoad);
		};
		P.handleInit = function() {
			let {app} = Framework;
			if(app === undefined) return;
			const setting = Framework.getSetting(C.SettingName);
			if(C.FeatureSettings[setting] === undefined) {
				Framework.setSetting(C.SettingName, C.SettingDefault);
				Framework.toggleSettingClass(C.SettingName, C.SettingDefault);
			}
			this.handleChange();
		};
		P.handleChange = function(event) {
			if(event) Framework.handleSettingsChange(event);
			const setting = Framework.getSetting(C.SettingName);
			Framework.toggleSettingClass(C.SettingName, C.FeatureSettings[setting].value);
			let effects = this.getTriggerEffects('threeinthecorner');
			effects.length = 0;
			effects.push(setting);
			(setting === 'off') ? this.detachElem() : this.attachElem();
		};
		P.addFeature = function() {
			Framework.addSetting({
				group: 'experimental', name: C.SettingName, content: '3-In-The-Corner Effect:',
				init: this.handleInit, handler: this.handleChange,
				tag: 'multi',
				options: Object.entries(C.FeatureSettings)
					.map(([value, {label: content}]) => ({value, content})),
				style: 'display: flex; gap: 0.5rem;',
			});
		};
		return C;
	})();
	FeaturePuzzleEvents.EffectConfetti = EffectConfetti;
	FeaturePuzzleEvents.PuzzleEffectConfetti = PuzzleEffectConfetti;
	FeaturePuzzleEvents.effects = [
		PuzzleEffectConfetti
	];
	FeaturePuzzleEvents.triggers = [
		PuzzleTriggerThreeInTheCorner,
		PuzzleTriggerBDaySpecial
	];

	const featurePuzzleEvents = new FeaturePuzzleEvents();
	featurePuzzleEvents.addEffect('confetti', new PuzzleEffectConfetti());
	featurePuzzleEvents.addEffect('deetdeetdoot', new PuzzleEffectDeetDeetDoot());
	featurePuzzleEvents.addTrigger('threeinthecorner', new PuzzleTriggerThreeInTheCorner());
	featurePuzzleEvents.addTriggerEffect('threeinthecorner', 'deetdeetdoot');
	
	Framework.getApp().then(() => featurePuzzleEvents.addFeature());

	return FeaturePuzzleEvents;
})();