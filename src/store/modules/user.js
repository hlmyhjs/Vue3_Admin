import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/avatar.png'
import { setTimeStamp } from '@/utils/timeStamp'

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const verifyCode = userInfo.verifyCode
      return new Promise((resolve, reject) => {
        login(username, password, verifyCode)
          .then((res) => {
            setToken(res.data.token)
            // 保存登录时间
            setTimeStamp()
            this.token = res.data.token
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then(async (res) => {
            const user = res.data
            const userAvatar =
              user.avatar == '' || user.avatar == null ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar

            // if (res.roles && res.roles.length > 0) {
            // if (res.data?.role_id) {
            if (res.data?.role_id) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.data.role_id
              this.permissions = res.data.permissions
              // this.permissions = ['*:*:*'] // 超级管理员
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.name = user.username
            this.avatar = user.avatar ?? userAvatar
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
})

export default useUserStore
