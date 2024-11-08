<script>
  export let cells;
  export let live;

  const colors = [
    "#ecc94b",
    "#F59E9E",
    "#ed8936",
    "#f56565",
    "#F43F5E",
    "#ed64a6",
    "#9f7aea",
    "#667eea",
    "#4299e1",
    "#06B6D4",
    "#38b2ac",
    "#10b981",
    "#48bb78",
    "#84cc16",
  ];
</script>

<div class="bg-white shadow-md rounded-lg p-6 max-w-md w-full mx-auto">
  <h1 class="text-2xl font-bold mb-4">User Details Form</h1>
  <form>
    <!-- Name Input -->
    <div class="mb-4">
      <label for="name" class="block text-gray-700">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        class="mt-2 p-2 border rounded w-full"
        placeholder="Enter your name"
        required
      />
    </div>
    <!-- Color Selection -->
    <div class="mb-4">
      <label for="color" class="block text-gray-700">Select Color</label>
      <div
        class="mt-2 grid"
        style="grid-template-columns: repeat(auto-fit, minmax(10px, max-content));"
      >
        {#each colors as color, idx}
          <label>
            <input
              type="radio"
              name="color"
              value={color}
              class="hidden peer"
              checked={idx === 0}
            />
            <span
              class="inline-block w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer peer-checked:ring-2 peer-checked:border-black"
              style:background-color={color}
            >
            </span>
          </label>
        {/each}
      </div>
    </div>
    <!-- Room Name Input -->
    <div class="mb-4">
      <label for="room" class="block text-gray-700">Room Name</label>
      <input
        type="text"
        id="room"
        name="room"
        class="mt-2 p-2 border rounded w-full"
        placeholder="Enter room name"
      />
    </div>
    <!-- Submit Button -->
    <button
      type="submit"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
    >
      Submit
    </button>
  </form>
</div>
