/**
 * JAWLocalStorageLib(Jack-A-Wang's Local Storage Library)
 * Description: A JavaScript library for managing local storage
 * Author: Jacob-A-Wang
 */

const JAWLocalStorageLib = {
    /**
     * 检查 localStorage 是否可用
     * @returns {boolean} localStorage 是否可用
     */
    isLocalStorageAvailable() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * 检查 localStorage 是否为空
     * @returns {boolean} localStorage 是否为空
     */
    isLocalStorageEmpty() {
        return localStorage.length === 0;
    },

    /**
     * 写入数据到 localStorage
     * @param {string} key 键名
     * @param {any} value 值
     * @returns {boolean} 是否写入成功
     */
    setItem(key, value) {
        if (typeof key !== 'string') {
            console.error('The param "key" must be a string');
            return false;
        }
        if (!this.isLocalStorageAvailable()) {
            console.error('LocalStorage is not available');
            return false;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Failed to set item:', e);
            return false;
        }
    },

    /**
     * 从 localStorage 获取数据
     * @param {string} key 键名
     * @returns {any} 存储的值，获取失败返回null
     */
    getItem(key) {
        if (typeof key !== 'string') {
            console.error('The param "key" must be a string');
            return null;
        }
        if (!this.isLocalStorageAvailable()) {
            console.error('LocalStorage is not available');
            return null;
        }
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Failed to get item:', e);
            return null;
        }
    },

    /**
     * 删除 localStorage 中的某个键值对
     * @param {string} key 键名
     * @returns {boolean} 是否删除成功
     */
    removeItem(key) {
        if (typeof key !== 'string') {
            console.error('The param "key" must be a string');
            return false;
        }
        if (!this.isLocalStorageAvailable()) {
            console.error('LocalStorage is not available');
            return false;
        }
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove item:', e);
            return false;
        }
    },

    /**
     * 清除所有 localStorage 内容
     * @returns {boolean} 是否清除成功
     */
    clear() {
        if (!this.isLocalStorageAvailable()) {
            console.error('LocalStorage is not available');
            return false;
        }
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Failed to clear local storage:', e);
            return false;
        }
    }
}