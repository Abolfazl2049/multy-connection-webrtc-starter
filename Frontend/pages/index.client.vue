<script setup lang="ts">
import {RtcConnectionHandler} from "~/core/models/rtc.model";
const localStream = ref<MediaStream>();
let rtcHandler = ref<RtcConnectionHandler | null>(null);
const roomId = ref<string>();
const pageUpdateCount = ref(0);
const isMicEnabled = ref(false);
const isVideoEnabled = ref(false);

let joinRoom = () => {
  rtcHandler.value = new RtcConnectionHandler({
    localStream: localStream.value!,
    userId: crypto.randomUUID(),
    roomId: roomId.value!,
    onStreamReceive(stream) {
      console.log("stream received");
      pageUpdateCount.value++;
    }
  });
};

const participants = computed(() => rtcHandler.value?.participants || []);

let leaveRoom = () => {
  rtcHandler.value?.clear();
  rtcHandler.value = null;
};

const toggleMic = () => {
  if (localStream.value?.getAudioTracks()[0]) {
    localStream.value.getAudioTracks()[0].enabled = !localStream.value.getAudioTracks()[0].enabled;
    isMicEnabled.value = !isMicEnabled.value;
  }
};

const toggleVideo = () => {
  if (localStream.value?.getVideoTracks()[0]) {
    localStream.value.getVideoTracks()[0].enabled = !localStream.value.getVideoTracks()[0].enabled;
    isVideoEnabled.value = !isVideoEnabled.value;
  }
};

const isMobile = ref(false);
const isTablet = ref(false);

const updateBreakpoint = () => {
  isMobile.value = window.innerWidth < 768;
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024;
};

const gridColumns = computed(() => {
  const count = participants.value.length + 1;
  if (isMobile.value) {
    return count <= 2 ? "repeat(1, 1fr)" : "repeat(2, 1fr)";
  }
  if (isTablet.value) {
    return count <= 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  }
  if (count <= 2) return "repeat(2, 1fr)";
  if (count <= 4) return "repeat(2, 1fr)";
  if (count <= 9) return "repeat(3, 1fr)";
  return "repeat(4, 1fr)";
});
onMounted(async () => {
  updateBreakpoint();
  window.addEventListener("resize", updateBreakpoint);
  await navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
    localStream.value = stream;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateBreakpoint);
});
</script>
<template>
  <div class="flex flex-col h-screen bg-zinc-900">
    <!-- Header / Room Controls -->
    <div class="bg-zinc-800 border-b border-zinc-700 p-3 sm:p-4 shadow-lg">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <input
          v-model="roomId"
          :disabled="!!rtcHandler"
          class="flex-1 border-2 border-zinc-600 bg-zinc-700 text-white p-2 rounded text-sm sm:text-base focus:outline-none focus:border-blue-500 placeholder-zinc-400"
          placeholder="Enter Room ID" />
        <button
          @click="() => (rtcHandler ? leaveRoom() : joinRoom())"
          :class="[
            'px-4 sm:px-6 py-2 rounded font-semibold transition-all text-sm sm:text-base',
            rtcHandler ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-green-600 hover:bg-green-700 active:scale-95'
          ]"
          class="text-white whitespace-nowrap">
          {{ rtcHandler ? "Leave Room" : "Join Room" }}
        </button>
      </div>
    </div>

    <!-- Media Control Buttons -->
    <div class="bg-zinc-800 border-b border-zinc-700 px-3 sm:px-4 py-2 sm:py-3 shadow-md">
      <div class="max-w-6xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3">
        <span class="text-xs sm:text-sm text-zinc-300 font-semibold">Controls:</span>
        <button
          @click="toggleMic"
          :class="[
            'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded transition-all font-medium text-xs sm:text-sm',
            isMicEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          ]"
          class="text-white">
          {{ isMobile ? "🎤" : isMicEnabled ? "🔇 Unmute" : "🎤 Mute" }}
        </button>
        <button
          @click="toggleVideo"
          :class="[
            'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded transition-all font-medium text-xs sm:text-sm',
            isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          ]"
          class="text-white">
          {{ isMobile ? "📹" : isVideoEnabled ? "🚫 Camera Off" : "📹 Camera On" }}
        </button>
      </div>
    </div>

    <!-- Video Grid -->
    <div class="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-zinc-900">
      <div
        :key="`video-flex-${pageUpdateCount}`"
        :style="{gridTemplateColumns: gridColumns}"
        class="grid gap-2 sm:gap-3 md:gap-4 auto-rows-max max-w-6xl mx-auto">
        <div class="relative rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-zinc-700">
          <video
            :srcObject="localStream"
            autoplay
            playsinline
            class="w-full aspect-video object-cover -scale-x-100" />
          <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 text-sm font-medium rounded-full text-white">You</div>
        </div>
        <div
          v-for="(participant, index) in participants"
          :key="index"
          class="relative rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-zinc-700">
          <video
            :srcObject="participant.stream"
            autoplay
            playsinline
            class="w-full aspect-video object-cover -scale-x-100" />
          <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 text-sm font-medium rounded-full text-white">
            Participant {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-zinc-800 border-t border-zinc-700 p-3 sm:p-4 text-center text-xs sm:text-sm">
      <p class="text-zinc-300">
        Made by <span class="font-semibold text-white">Abolfazl2049</span> •
        <a
          href="https://github.com/Abolfazl2049"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-400 hover:text-blue-300 font-medium transition-colors underline">
          GitHub
        </a>
      </p>
    </div>
  </div>
</template>
<style scoped>
video {
  display: block;
}
</style>
