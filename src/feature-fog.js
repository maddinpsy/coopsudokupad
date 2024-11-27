
const FeatureFog = (() => {
	// Helpers
	const cellListsEqual = (a, b) => {
		if (a.length !== b.length) return false;
		for (let i = 0, len = a.length; i < len; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	};
	const lightUpLamps = (grid, lamps) => {
		const { rows, cols } = grid;
		const cells = [];
		for (let l = 0, len = lamps.length; l < len; l++) {
			let { row: r, col: c } = lamps[l];
			for (let r0 = Math.max(0, r - 1), r1 = Math.min(rows - 1, r + 1); r0 <= r1; r0++) {
				for (let c0 = Math.max(0, c - 1), c1 = Math.min(cols - 1, c + 1); c0 <= c1; c0++) {
					let cell = grid.getCell(r0, c0);
					if (!cells.includes(cell)) cells.push(cell);
				}
			}
		}
		return cells;
	};

	function FeatureFog() {
		bindHandlers(this);
		this.featureStylesheet = undefined;
		this.featureEnabled = false;
		// document.querySelector('svg#svgrenderer').style.opacity = 0;
		this.litCells = [];
	}
	const C = FeatureFog, P = Object.assign(C.prototype, { constructor: C });
	C.Name = 'fog';
	C.SettingName = 'foganim';
	C.fogSize = 0.2;
	C.fogDark = 0.235;
	C.fogLight = 0.9;
	C.fogCrossFadeMs = 150;
	C.fogCrossFadeInterval = 33;
	C.featureStyle = (`
		:root {
			--fog-mask-white: #fff;
			--fog-mask-black: #000;
		}
		.fog-mask-white { fill: var(--fog-mask-white); }
		.fog-mask-black { fill: var(--fog-mask-black); }
		#fog-edge * {
			fill: var(--fog-mask-black);
			stroke-linecap: butt;
			stroke-linejoin: round;
		}
		#fog-fogcover { fill: #afafaf; }
		.setting-darkmode #fog-fogcover { fill: #4d4d4d; }
	`);
	C.CageStyles = {
		puzzlefog: { offset: 0, border: {} },
	};
	C.FoggedLayers = ['background', 'underlay', 'arrows', 'cages', 'cell-errors', 'overlay', 'cell-givens'];
	C.puzzleHasFog = (puzzle = {}) => puzzle.foglight !== undefined;
	// API
	C.create = async function () {
		const feature = new C();
		Framework.withApp(() => feature.addFeature());
	};
	P.init = async function () {
		Framework.features = Framework.features || {};
		if (Framework.features[C.Name] !== undefined) {
			console.error('Feature "%s" already exists.', C.Name);
		}
		else {
			Framework.features[C.Name] = this;
		}
		const proto = Object.getPrototypeOf(this);
		for await (const prop of Object.getOwnPropertyNames(proto)) {
			if ('function' !== typeof this[prop] || !/^handleInit.*/.test(prop)) continue;
			await this[prop]();
		}
		if (C.featureStyle) this.featureStylesheet = await attachStylesheet(C.featureStyle);
	};
	P.addFeature = async function () {
		this.init();
	};
	P.removeFeature = async function () {
		this.featureEnabled = false;
		if (this.featureStylesheet) this.featureStylesheet.remove();
		if (typeof this.detachElem === 'function') this.detachElem();
	};
	P.getFogEdgeSvg = function (count, size = C.fogSize, dark = C.fogDark, light = C.fogLight) {
		const { CellSize: CS } = SvgRenderer, elems = [];
		for (let i = 0; i < count; i++) {
			const p = (count - i) / count,
				edgeWidth = Math.round(p * ((CS * 2) * size) * 10) / 10,
				p2 = 1 - (1 - p) * (1 - p),
				v = Math.round((dark + (light - dark) * p2) * 255),
				edgeColor = `rgb(${v},${v},${v})`;
			elems.push(`<use stroke-width="${edgeWidth}px" stroke="${edgeColor}" href="#fog-shape"/>`);
		}
		return elems.join('\n');
	};
	P.getLitCells = function () {
		const { app: { puzzle: { cells, grid }, currentPuzzle = {} } } = Framework;
		const { solution, fogofwar: puzzlefog = '', foglight = [] } = currentPuzzle;
		const lampCells = Puzzle.resolveRC(puzzlefog).map(([r, c]) => grid.getCell(r - 1, c - 1));
		const litCells = [];
		for (let i = 0, len = cells.length; i < len; i++) {
			const cell = cells[i], cellVal = cell.propGet('normal');
			if (cellVal === undefined) continue;
			if (cell.hasProp('given')) {
				if (cell.propGet('given') === cellVal) litCells.push(cell);
			}
			else if (solution !== undefined) {
				if (cellVal === solution[i]) lampCells.push(cell);
			}
			else if (cellVal !== '.') {
				lampCells.push(cell);
			}
		}
		litCells.push(...new Set([
			...lightUpLamps(grid, lampCells),
			...foglight.map(([r, c]) => grid.getCell(r, c))
		]));
		return litCells;
	};
	P.getFoggedLayers = function () {
		const { app: { svgRenderer } } = Framework, svgElem = svgRenderer.getElem();
		return foggedLayers = svgElem.querySelectorAll(C.FoggedLayers.map(id => `#${id}`).join(','));
	};
	P.forceRedraw = function () {
		// WORKAROUND: SVG rendering bug in Chrome 122
		const { app: { svgRenderer } } = Framework, svgElem = svgRenderer.getElem();
		const el = svgElem.parentNode, display = el.style.display;
		el.style.display = 'none';
		el.offsetHeight;
		el.style.display = display;
	};
	P.clearFog = function () {
		const { app: { svgRenderer } } = Framework, svgElem = svgRenderer.getElem();
		svgElem.querySelectorAll('#fog-defs, #fog-fogcover').forEach(elem => elem.remove());
		this.getFoggedLayers().forEach(elem => elem.removeAttribute('mask'));
		this.forceRedraw();
	};
	P.initFog = function () {
		if (document.querySelector('#fog-defs') &&
			(document.querySelector('#fog-fogcover') || {}).textContent
		) return;
		const { app: { svgRenderer, puzzle: { rows, cols }, currentPuzzle = {} } } = Framework;
		if (!C.puzzleHasFog(currentPuzzle)) return;
		Object.keys(C.CageStyles).forEach(key => SvgRenderer.styles.cageBorders[key] = C.CageStyles[key]);
		this.clearFog();
		const { CellSize: CS } = SvgRenderer, svgElem = svgRenderer.getElem();
		const { left: x, top: y, width, height } = svgRenderer.getContentBounds();
		const boardRect = `x="0" y="0" width="${cols * CS}" height="${rows * CS}"`;
		const boardEdgeRect = `x="${x}" y="${y}" width="${width}" height="${height}"`;
		svgElem.insertAdjacentHTML('afterbegin', `
			<defs id="fog-defs">
				<mask id="fog-mask-fog" maskUnits="userSpaceOnUse" ${boardEdgeRect}>
					<rect class="fog-mask-white" ${boardEdgeRect}/>
					<use href="#fog-edge" class="fog-mask-black"/>
				</mask>
				<mask id="fog-mask-light" maskUnits="userSpaceOnUse" ${boardEdgeRect}>
					<rect class="fog-mask-white" ${boardEdgeRect}/>
					<rect class="fog-mask-black" mask="url(#fog-mask-fog)" ${boardEdgeRect}/>
				</mask>
				<g id="fog-shape">
					<g id="fog-path"/>
					<g id="fog-fadeout"/>
					<g id="fog-fadein"/>
				</g>
				<g id="fog-edge">
					${this.getFogEdgeSvg(4)}
					<use href="#fog-shape"/>
				</g>
			</defs>
			<g id="fog-fogcover">
				<rect mask="url(#fog-mask-light)" ${boardRect}/>
			</g>
		`);
		this.pathElem = svgElem.querySelector('#fog-path');
		this.fadeoutElem = svgElem.querySelector('#fog-fadeout');
		this.fadeinElem = svgElem.querySelector('#fog-fadein');
		this.getFoggedLayers().forEach(elem => elem.setAttribute('mask', 'url(#fog-mask-fog)'));
	};
	P.renderFog = async function (force = false) {
		this.initFog();
		const { CellSize } = SvgRenderer;
		const { app: { svgRenderer, puzzle: { cells }, currentPuzzle = {} } } = Framework;
		if (currentPuzzle.foglight === undefined) return;
		const prevLit = this.litCells, nextLit = this.getLitCells();
		if (!force && cellListsEqual(prevLit, nextLit)) return;
		this.litCells = nextLit;
		cells.forEach(cell => {
			let hideclue = !nextLit.includes(cell);
			if (cell.hideclue !== hideclue) {
				cell.hideclue = hideclue;
				cell.renderContent();
			}
		});
		// Update changed cells
		const prevCells = cells.filter(cell => !prevLit.includes(cell));
		const nextCells = cells.filter(cell => !nextLit.includes(cell));
		const unionCells = cells.filter(cell => prevCells.includes(cell) && nextCells.includes(cell));
		// Render new puzzlefog
		const cellsToPath = cells => svgRenderer
			.getCellOutline(cells)
			.map(([t, r, c], idx) => t === 'Z' ? t : `${t}${c * CellSize} ${r * CellSize}`)
			.join(' ');
		const createFogCage = (cells = []) => cells.length === 0 ? '' : `<path vector-effect="non-scaling-stroke" d="${cellsToPath(cells)}"/>`;
		const clearFade = () => {
			cancelAnimationFrame(this.rafId);
			this.rafId = undefined;
			this.fadeStartTime = undefined;
			this.fadeinElem.style.opacity = 1;
			this.fadeoutElem.style.opacity = 0;
			this.forceRedraw();
		};
		const fadeFrame = (time) => {
			if (this.fadeStartTime === undefined) {
				this.fadeStartTime = time;
				this.lastFrameTime = time - 1000 / 60;
				this.fadeTime = 0;
			}
			const progress = (time - this.fadeStartTime) / C.fogCrossFadeMs;
			const dt = time - this.lastFrameTime;
			this.lastFrameTime = time;
			this.fadeTime += dt;
			while (this.fadeTime >= C.fogCrossFadeInterval) {
				this.fadeinElem.style.opacity = Math.min(1, Math.max(0, progress));
				this.fadeoutElem.style.opacity = Math.min(1, Math.max(0, 1 - progress));
				this.fadeTime -= C.fogCrossFadeInterval;
			}
			this.forceRedraw();
			if (progress >= 1) return clearFade();
			this.rafId = requestAnimationFrame(fadeFrame);
		};
		const startFade = () => {
			this.pathElem.innerHTML = createFogCage(unionCells);
			const foggedCells = nextCells.filter(cell => !prevCells.includes(cell));
			const revealedCells = prevCells.filter(cell => !nextCells.includes(cell));
			this.fadeoutElem.innerHTML = createFogCage(revealedCells);
			this.fadeinElem.innerHTML = createFogCage(foggedCells);
			this.fadeinElem.style.opacity = 0;
			this.fadeoutElem.style.opacity = 1;
			this.fadeStartTime = undefined;
			this.forceRedraw();
			if (this.rafId === undefined) this.rafId = requestAnimationFrame(fadeFrame);
		};
		clearFade();
		if (force || !Framework.getSetting(C.SettingName)) {
			this.pathElem.innerHTML = createFogCage(nextCells);
			this.fadeoutElem.innerHTML = '';
			this.fadeinElem.innerHTML = '';
		}
		else {
			startFade();
		}
	};
	P.handleAct = function (act, action) {
		if (['value', 'clear', 'undo', 'redo'].includes(action.type)) this.renderFog();
	};
	P.handleUpdateFog = function () {
		let { app } = Framework, { puzzle } = app;
		if (!puzzle.replayPlaying) this.renderFog(true);
	};
	P.attachElem = function () {
		let { app, app: { puzzle } } = Framework;
		if (app === undefined) return;
		if (this.featureEnabled) return;
		this.featureEnabled = true;
		puzzle.on('act', this.handleAct);
		let actListeners = puzzle.getEventListeners('act');
		actListeners.unshift(actListeners.pop()); // Move listener to top
		puzzle.on('start', this.handleUpdateFog);
		this.renderFog(true);
		puzzle.on('loaded', this.handleUpdateFog);
		puzzle.on('progressloaded', this.handleUpdateFog);
	};
	P.detachElem = function () {
		let { app } = Framework, { puzzle } = app;
		if (app === undefined) return;
		if (!this.featureEnabled) return;
		this.featureEnabled = false;
		app.off('act', this.handleAct);
		app.puzzle.off('start', this.handleUpdateFog);
		app.puzzle.off('loaded', this.handleUpdateFog);
		app.puzzle.off('progressloaded', this.handleUpdateFog);
		puzzle.cells.map(cell => {
			delete cell.layer;
			delete cell.renderedValues['colours'];
			delete cell.hideclue;
			cell.renderContent();
		});
		this.litCells = [];
		this.clearFog();
	};
	// Setting
	P.handleInit = async function () {
		this.attachElem();
		Framework.addSetting({
			tag: 'toggle', group: 'visual',
			name: C.SettingName,
			content: 'Puzzle Fog Animation'
		});
		this.featureStylesheet = await attachStylesheet(C.featureStyle);
		document.querySelector('svg#svgrenderer').style.removeProperty('opacity');
		// WORKAROUND: Prevent svenpeek from playing more than once
		const svenpeekEl = document.querySelector('#svenpeek');
		svenpeekEl.addEventListener('animationend', () => svenpeekEl.remove());
	};

	return C;
})();

FeatureFog.create();