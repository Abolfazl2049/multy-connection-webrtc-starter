<script setup lang="ts">
import {RtcConnectionHandler} from "~/core/models/rtc.model";
const localStream = ref<MediaStream>();
let rtcHandler = ref<RtcConnectionHandler | null>(null);
const roomId = ref<string>();
const pageUpdateCount = ref(0);
// const streams = ref<MediaStream[]>([]);
let joinRoom = () => {
  rtcHandler.value = new RtcConnectionHandler({
    localStream: localStream.value!,
    userId: crypto.randomUUID(),
    roomId: roomId.value!,
    onStreamReceive(stream) {
      pageUpdateCount.value++;
      // const duplicate = streams.value.findIndex(({id}) => stream.id === id);
      // if (duplicate === -1) streams.value.push(stream);
      // else streams.value.splice(duplicate, 1, stream);
    }
  });
};

let leaveRoom = () => {
  // gracefully disconnecting

  rtcHandler.value?.clear();
  rtcHandler.value = null;
};

await navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
  localStream.value = stream;
});
</script>
<template>
  <div class="flex p-2 gap-2 border-b">
    {{ pageUpdateCount }}
    <input
      v-model="roomId"
      :disabled="rtcHandler?.participants ? true : false"
      class="border-2 p-1"
      placeholder="Room id" />
    <button
      @click="() => (rtcHandler ? leaveRoom() : joinRoom())"
      class="bg-red-600 text-white p-2">
      {{ rtcHandler ? "Leave Room" : "Join Room" }}
    </button>
  </div>
  <div class="m-5 *:bg-red-600 space-x-3 *:p-2 text-white">
    <button @click="localStream!.getAudioTracks()[0].enabled = !localStream!.getAudioTracks()[0].enabled">mute audio</button>
    <button @click="localStream!.getVideoTracks()[0].enabled = !localStream!.getVideoTracks()[0].enabled">mute video</button>
  </div>
  <div
    :key="`video-grid-${pageUpdateCount}`"
    class="p-5 flex flex-wrap gap-5 border">
    <video
      :srcObject="localStream"
      autoplay
      playsinline />
    <video
      v-for="i in rtcHandler?.participants"
      :srcObject="i"
      autoplay />
  </div>
  <div>
    Note : Enter the same Room id to connect to each other <br />
    And Be patient !
  </div>
</template>
<style>
video {
  @apply -scale-x-100 size-[200px];
}
</style>
