import { reactive, ref } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { IEnterRoomForm } from "@/modules/game/types/frontend-types";

export function useEnterRoomForm() {
  const enterRoomForm = reactive<IEnterRoomForm>({
    name: "",
    roomId: "",
    characterId: "",
  });

  const convertToUppercase = () => {
    enterRoomForm.roomId = enterRoomForm.roomId.toUpperCase();
  };

  const enterRoomFormRef = ref<FormInstance>();

  const rules = reactive<FormRules<IEnterRoomForm>>({
    name: [
      {
        required: true,
        message: "Поле не может быть пустым",
        trigger: "blur",
      },
      { min: 3, max: 255, message: "От 3 до 255 симвлдлв", trigger: "blur" },
    ],
    roomId: [
      {
        required: true,
        message: "Поле не может быть пустым",
        trigger: "blur",
      },
      { min: 4, max: 4, message: "4-х значный код", trigger: "blur" },
    ],
    characterId: [
      {
        required: true,
        message: "Поле не может быть пустым",
        trigger: "blur",
      },
    ],
  });

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    formEl.resetFields();
  };

  return {
    enterRoomFormRef,
    enterRoomForm,
    rules,
    resetForm,
    convertToUppercase,
  };
}
