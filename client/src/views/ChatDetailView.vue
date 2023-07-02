<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, watch, onUnmounted, onMounted, nextTick } from "vue";
import { defineProps } from "vue";
import { computed } from "vue";
import UserMessage from "@/components/UserMessage.vue";
import { reactive } from "vue";

const router = useRouter();
const route = useRoute();
const initialLoad = ref(true);
const converstionId = ref(route.params.id);
const messages = ref([]);
const chatSendText = ref("");
const textAreaDisabled = ref(false);
const numLines = ref(1);

const sendMessage = () => {
  if (chatSendText.value.length > 0) {
    window.glb.syncerObj.openChat.addMessage = chatSendText.value;
    chatSendText.value = "";
  }
  chatSendInput.value.focus();
};

watch(
  () => window.glb.syncerObj?.openChat?.messages,
  (newVal, oldVal) => {
    messages.value = newVal;
    if (
      newVal?.length > oldVal?.length ||
      !window.glb.syncerObj?.openChat?.messages
    )
      nextTick(() => {
        const chatMessages = document.getElementById("chat-messages");
        if (!chatMessages) return;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }
);

const updateNumLines = () => {
  numLines.value = chatSendText.value.split("\n").length;
};

watch(chatSendText, updateNumLines);

const clamp = (number, min, max) => Math.max(min, Math.min(number, max));

async function openConversation(id) {
  let res = await window.glb.safeAuthedReq("/api/openConversation", { id: id });
  if (res) {
    window.glb.syncerObj.openChat.participants = res.Users;
    window.glb.syncerObj.openChat.otherUser = res.Users.find(
      (u) => u.id != window.glb.user.id
    );
  } else {
    window.glb.addNotf("error", "Error creating chat");
  }
}
watch([() => route.params.id, initialLoad], async (newVal, oldVal) => {
  if (newVal != oldVal) {
    window.glb.syncerObj.openChat = { conversationId: null };
    await openConversation(route.params.id);
    window.glb.syncerObj.openChat.conversationId = route.params.id;
    nextTick(() => {
      chatSendText.value = "";
      chatSendInput.value.focus();
    });
  }
});

const chatSendInput = ref(null);
watch(
  () => window.glb.syncerObj?.openChat?.messagesResponded,
  (newVal, oldVal) => {
    if (newVal) {
      const chatMessages = document.getElementById("chat-messages");
      if (!chatMessages) return;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
);

initialLoad.value = false;
</script>

<template>
  <div
    class="w-full h-full overflow-auto"
    v-loading-bar="{ loading: !window.glb.syncerObj.openChat?.messages }"
  >
    <div
      class="flex flex-col w-full h-full overflow-auto"
      v-if="window.glb.syncerObj.openChat?.conversationId"
    >
      <div
        class="h-full w-full themed-bg-primary flex flex-col overflow-auto"
        id="chat-messages"
        v-if="window.glb.syncerObj.openChat.messages"
      >
        <div
          v-for="(message, index) in window.glb.syncerObj.openChat.messages"
          :key="message.id"
          class=""
        >
          <UserMessage
            :message="message"
            :user="
              window.glb.syncerObj.openChat.participants.find(
                (u) => u.id == message.UserId
              )
            "
            index="message.id"
          />
          <div class="px-8 w-full">
            <div class="h-[1px] bg-gray-200/50"></div>
          </div>
        </div>
      </div>
      <div class="flex justify-center sticky bottom-0">
        <textarea
          :style="{ height: clamp(1 * numLines + 2, 0, 6) + 'rem' }"
          ref="chatSendInput"
          class="center p-2 m-2 w-full themed-bg-secondary rounded-md border"
          type="text"
          v-model="chatSendText"
          @keydown.enter.exact.prevent="sendMessage()"
          :readonly="textAreaDisabled"
        />
        <button class="p-2 m-2 ml-0 btn" @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>
