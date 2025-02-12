import { VxeUI } from 'vxe-pc-ui';
export const _t = str => "`" + str + "`";

export const showToast = (content) => {
    VxeUI.modal.message({
        content,
        status: 'success',
    });
}
