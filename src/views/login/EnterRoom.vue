<script lang="ts">
//@ts-ignore
import { socket } from "@/socket";
import { mapState } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMainStore } from "@/stores/main";
import MainInput from "@/package/components/MainInput.vue";
import MainButton from "@/package/components/MainButton.vue";
import { getRandomAvatar } from "@/package/helpers/all-avatars-list";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EnterRoom",
  components: { MainButton, MainInput },

  data() {
    const userStore = useUserStore();
    const mainStore = useMainStore();

    return {
      userStore,
      mainStore,
      room: "",
      isSubmitDisabled: false,
    };
  },

  computed: {
    ...mapState(useUserStore, {
      saveNameValue: "name",
    }),
  },

  methods: {
    goRoom() {
      this.isSubmitDisabled = true;

      const userData = {
        name: this.saveNameValue,
        room: this.room,
        isReady: false,
        avatar: getRandomAvatar(),
      };

      this.userStore.setRoom(this.room);
      socket.connect();

      socket.emit("connectingExistingRoom", userData, (data: any) => {
        if (typeof data === "string") {
          this.mainStore.createNotification({
            type: "danger",
            description: data,
          });
        } else {
          this.userStore.saveId(data.userId);
          this.$router.push(this.room);
        }

        this.isSubmitDisabled = false;
      });
    },

    checkUpperCase() {
      this.room = this.room.toUpperCase();
    },
  },
});
</script>

<template>
  <form class="enter-room" @submit.prevent="goRoom">
    <MainInput
      v-model="room"
      placeholder="Номер комнаты"
      left-icon="lock"
      :maxlength="4"
      @input="checkUpperCase"
    />

    <MainButton
      type="submit"
      label="Войти"
      :disabled="room.trim().length !== 4 || isSubmitDisabled"
    />
  </form>
</template>

<style lang="scss" scoped>
.enter-room {
  width: 400px;
  background: white;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
}

@media (max-width: 420px) {
  .enter-room {
    width: 100%;
  }
}
</style>
