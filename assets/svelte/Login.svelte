<script>
  export let cells;
  export let live;

  const colors = [
    "bg-yellow-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-rose-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-green-500",
    "bg-lime-500",
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
              class="inline-block w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer {color} peer-checked:ring-2 peer-checked:border-black"
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
