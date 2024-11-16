import { App, SvgRenderer, Puzzle } from "./sudokupad.app/script.js";
import { PuzzleLoader } from './sudokupad.app/puzzleloader.js'

renderGridLines = function (svgRenderer, rows, cols) {
    [...svgRenderer.getElem().querySelectorAll('.cell-grids .cell-grid')].forEach(elem => elem.remove());
    let lines = [];
    for (var r = 0; r <= rows; r++) lines.push([[r, 0], [r, cols]]);
    for (var c = 0; c <= cols; c++) lines.push([[0, c], [rows, c]]);
    svgRenderer.renderPart({
        target: 'cell-grids',
        type: 'path',
        attr: {
            class: 'cell-grid',
            d: lines.map(SvgRenderer.rcToPathData).join(' '),
        }
    });
};

rednerCages = function (svgRenderer, cages) {
    (cages || []).forEach(cage => {
        if ((cage.cells || []).length === 0) return;
        if (cage.hidden === true) return;
        // if (cage.unique && solution) {
        //     const cellSol = cage.parsedCells
        //         .map(cell => solution[this.cells.indexOf(cell)])
        //         .filter(v => !Puzzle.SolutionBlanks.includes(v));
        //     if (hasDupes(cellSol)) cage.unique = false;
        // }
        const cageTarget = cage.style === 'box' ? 'cell-grids' : 'cages';
        const cageOpts = Object.assign({}, cage, {
            target: cageTarget,
            cells: Puzzle.resolveRC(cage.cells).map(([r, c]) => ({ row: r - 1, col: c - 1 })),
            cageValue: cage.cageValue,
            //cageValue: String(cage.cageValue === undefined ? cage.sum : cage.cageValue),
            style: cage.style
        });
        svgRenderer.renderCage(cageOpts);
    });
}

export async function load() {
    const { parsePuzzleData, fetchPuzzle } = PuzzleLoader;

    const svgRenderer = new SvgRenderer()

    // const puzzleData = await fetchPuzzle('zsk8n4tjvw')
    // console.log(puzzleData)
    // puzzleData = 'sclN4SwJgXA5AjgTgNjAEQIoCkBKAHAZlAGgGMBnCAVgAZiBTCAbXoOZeYF0CnWWOvuDe/dpyECRQwRPH9JMjnDqN61Sr2oBGNQQBMvdQVWd9mozt7aD5gifoXdvegGZLnZzee7OAFhf0fNn096cl8QmxD7TnoEXxibGKCAdl9km2SggA5fLJssyMZqRy0vLXI9AiLTEtMyzgtK2wJqxrKHZwbnZudavwreH2afHpCGkOaQ1qiYhpjmmJ7khuTm5J6shqzmrMmCggQtRK0M8v3TQ9Njur2rc8bjtuvXAlvnS97T3tufN5CPkNuQvcpo9os9eDE3skPslbsk3lkPllbll7hwAK4MYBEAAuDEoADowoSOAB3CD6AAW5OI6ggAFEAEKJciOCxEbT0pksixwCC4AC+BCxuPo6kJ1mJBDJlOpRFpjOZrOIHIV3IIvIFQpxDDFEUl0oIVP0cs5irZKq5So1guFDG04vI+upRppEAAgo46ZQvFl2e7Pd6statSL7f8nTLjbSPV6fcr/bGg3z+RwAPaY7X0AC0BJCudJEAJ2hCVKLIRNAGIAGLx6vqvkEXBkbRZbF0dQAThtmZz4t1BbLhsL+OLrrrfrrGsbzdbdG0lG7It7etqZMHpZH5dp445k4bTYgLYIbcPXkXDGXBAyTvXw9HlZrE5rU4PR5P2jPIYvuYqN83Q8HB9a2ffcZ2POdz2zH8vD/UcN3vbdH13EDcGnQ9Z0PBBIMvR1VzvEt8LHJCID3VDXww9REmwn8EFggjAMQ4D6zIsCT0/W0oPFRI6IA/8gKfZi0LfOh2MzH9lwHf94K3EjiNIoSKMcSCwwICSpUI6SiKYl9WPbJSv1FcU1LXKTCP45DBPI8CIEcLCDMcIz83U28GNk7TQPQ6z9I4mCQmMjSzMYgSdM8k9vMzXDVKcky4MCtzgo84SbMg2i/OigLXJ3NyQqSjJIO4tKeM08zssSjCuwM69Crwly+KCiycvKlMCAAN0gehQEgWBMAAWRgABNAB1GAAFUADsAAUiEIbA0QAIwAGxAEgKRoMA3VxKB53nHNEizdRKAAFU7GzKELLwAC1CE2gB5MaaAAAkGgBDABPB7DtTB6AHEaGxB67oegBhOBnqIABrEAxoAcw+1bgbgV7sGxEAiAAQigFN+SAA'
    // puzzleData = 'fpuzN4IgzglgXgpiBcBOANCALhNAbO8QGUAHAJwgDsMyBzAAnJrQAsYaARAQ2IGsRV2BXJgHtiCAo3K0A4uwC2k3iGL8cYGGjEA5EbPZYaYfgBMhXfjWWqa7QoSwBPAHQAdMq4DyZGlWIwYXgHcJMEIYYhoschgwZGsjACt2AGN/NBojCCpMMBpZfjA0jIAzIrCaACN7azScdgKaAFZHGk8aQn5iOxZfMnL2L0iyaNiMrLQcop1rGiShMjUkwQgANxY1AEd+fxTY+n6qkSMw5oAxEQt/PvnrMiMaIIgQsJjrLH1B6OtfGgBmGZg3jksHMqC43GRWJlsnQvOx7hI0CwkhBiEkcLl8mkbKFODCGMwDB1iEJ+LdJP9Ac1NPxZOVnnimEiUWiWJwWJECjA7kVibIDLo3tE0mghBVMlQhc1WnDGcRZEJZOowiMoeMYUlfHUWDyFRUVOUGKKMIQwa5IWMcnMbl9iQFCXyRfiWKNMAyCcjUThmuboXsaFwIILwkl2BL7YanYa0Ho3UiRENiM0AMIArA5WZkIZJRF3SrTB6I9JCLHfDMLJarADcFLTMzmWZzFSqcPKWGSXCLJZY9EZFnYGFFAEZ4AAmZOp9P1mDZrlN6YANRo5wAGuHHQ0l+FBwAGWK+J7ZlYApyKHwQIwIADal+AAF9kHeH/fHy/n2+nwBdZA39+vp//v87y/H8AN/MDQOAwDwKgz9vxg+CwMg6DkIguCUIQ2CQIwhCkNAvCcK/dBmDlBUlVEeAbxAD4wCvS8QAAJRHJMABZFEYpMfhAD8P1vQieiuK9QGo2iGOYpMAHY2LEgAOKSk0QLieIfKiohoii6PYyTUHY2TtJ+JNZO43jUAeJ5iDUyjhPUhiGiTEc2IANjsxyOMU58VKGCyNKYzi9Nc7SxM4ozlKs68GP0hy2KYyLgqE1SRPYhooqTGKeMIgMgxDCVBJAFJASvcKk0HOTioC5zCOWPQtjESL3LytMCvo6SDLY5qFO0xAWo6+SuNQSqsGqvAR1qwjilKHoUhy+qLIYzrfNm8q6onRrbMi7SnJipb8oohi2rY8SerS1BiH7CAhCm5advY+ztMHRblOmxqDrWhiNq44yQE4W0ctCjTbNYsqAdEpMku41BHqu/73pC+LrPog6kvWkGXNS8HLo0hH3sIgAPZYLu27znO0pjioqqrcBAecQC2hqroO0rdqK3qQH6waQGXanCM2dgjGULp8dpjS7oZ+i7puhiSeS+yyYG6Ir0HZBmOQaTkEQJTQAhv6JLY2zdNe7WkcMvryYsn5FeV1WjpASYqEiKhGA0K6mPF+iZOZj4fthsLXYN4G9Z9hSwZAElsCiJMxAAYhObcHPE6PFACc8mAQbdHCV63eSTOYChO8hHYYy5+mpmHPISpitIlrrCsMwiQ4+cO8CjmO4+3BOk8YFO09QHVZCz+Y0FzigxHowuyGLuLS7h2yXacmfXKDuuw8j2Po9jtujGT+BU7NjOFT7nP2DzsQAHVglCczx48uW4Z8tj9Pmn2gtrwR6+Xlu15M9vO53nv94Hw+h54FPo8c+NF3K/UKi9diqNg4vyXo3Fezd16b23t3TO2d/5HyAWfZ4l8IGJWSjAxeQwG4gAjogj+IBE4bw7lvRwP90H90HvnYBZkwGETAEIAaA4x47XaiAPWiMQBAxehXcWDN5oMyBmIxQ/D5ovUEYoeRihxZCIZnrfhFcgbiMUHreaQNNGKCES9IRyjUAVz1lI2RKjFAV34SIoxNjUB6MUAzEx1jUAMy0UopxAjFDSJ8c43xajFAvX4XrHRqA5GhMcagAJPEgA==';
    puzzleData = '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'
    const puzzleObj = await parsePuzzleData(puzzleData)
    console.log(puzzleObj)
    const convertedPuzzle = App.prototype.convertPuzzle(puzzleObj)
    console.log(convertedPuzzle)

    const rows = (puzzleObj.cells || []).length;
    const cols = Math.max.apply(Math, (puzzleObj.cells || []).map(row => row.length));
    renderGridLines(svgRenderer, rows, cols)
    rednerCages(svgRenderer, convertedPuzzle.cages)

    svgRenderer.adjustViewBox(-64, -64, 656, 656)
}

export function select(cells, color) {
    const svgRenderer = new SvgRenderer()
    svgRenderer.renderCage({
        target: 'cell-highlights', style: 'selectioncage', borderColor: color,
        cells: cells
    });
}

export function clearSelection() {
    const svgRenderer = new SvgRenderer()
    svgRenderer.svgElem
        .querySelectorAll('#cell-highlights .cage-selectioncage')
        .forEach(elem => elem.remove());
}

export function getRC(x, y) {
    const svgRenderer = new SvgRenderer()
    const tlRect = svgRenderer.getElem().querySelectorAll('.cell-grid')[0].getBoundingClientRect();
    return {
        row: Math.floor((y - tlRect.y) / tlRect.height * 9),
        col: Math.floor((x - tlRect.x) / tlRect.width * 9)
    };
}

export function mixColors(hexColors) {
    if (!hexColors || !hexColors.length) return "#000000"; // Default to black if no colors provided

    // Convert hex to RGB
    const rgbColors = hexColors.map(hex => {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    });

    // Average RGB components
    const avgColor = rgbColors.reduce(
        (acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b,
        }),
        { r: 0, g: 0, b: 0 }
    );

    const total = hexColors.length;
    const mixed = {
        r: Math.round(avgColor.r / total),
        g: Math.round(avgColor.g / total),
        b: Math.round(avgColor.b / total),
    };

    // Convert RGB back to hex
    return '#' + (((1 << 24) | (mixed.r << 16) | (mixed.g << 8) | mixed.b)
        .toString(16)
        .slice(1)
        .toUpperCase());
}
