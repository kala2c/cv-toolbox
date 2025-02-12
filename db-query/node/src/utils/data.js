
/**
 * 创建随机字符串
 * @param length
 * @returns {string}
 */
export function generateRandomStr(length) {
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += str[Math.floor(Math.random() * str.length)];
    }
    return result;
}
