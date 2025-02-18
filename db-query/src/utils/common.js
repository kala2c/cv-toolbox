import { VxeUI } from 'vxe-pc-ui';
import moment from "moment";
export const _t = str => "`" + str + "`";

/**
 * 显示toast
 * @param content 文字
 * @param status 类型 success | warning | error | info | loading | question
 */
export const showToast = (content, status = 'success') => {
    VxeUI.modal.message({
        content,
        status,
    });
}

export const formatDateTime = date => {
    if (date instanceof Date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    } else {
        return date;
    }
}

export const showLoading = () => {
    VxeUI.loading.open();
}

export const hideLoading = () => {
    VxeUI.loading.close();
}
