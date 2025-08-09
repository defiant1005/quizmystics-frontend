import { reactive, ref } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { ICreateRoomForm } from "@/modules/game/types/frontend-types";

export function useCreateRoomForm() {
  const createRoomForm = reactive<ICreateRoomForm>({
    name: "",
    characterId: "",
  });

  const createRoomFormRef = ref<FormInstance>();

  const rules = reactive<FormRules<ICreateRoomForm>>({
    name: [
      {
        required: true,
        message: "Поле не может быть пустым",
        trigger: "blur",
      },
      { min: 3, max: 255, message: "От 3 до 255 симвлдлв", trigger: "blur" },
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
    createRoomFormRef,
    createRoomForm,
    rules,
    resetForm,
  };
}
