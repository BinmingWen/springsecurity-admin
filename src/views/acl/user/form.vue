<template>
  <div class="app-container">
    <el-form ref="user" :model="user" :rules="validateRules" label-width="120px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="user.username"/>
      </el-form-item>
      <el-form-item label="用户昵称">
        <el-input v-model="user.nickName"/>
      </el-form-item>

      <el-form-item label="用户密码" prop="password">
        <el-input v-model="user.password" show-password/>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="user.phone"/>
      </el-form-item>
      <el-form-item label="常用地址" prop="address">
        <div v-if="showAddress">
          <v-distpicker :placeholders="placeholders" @selected="selectedAddress"></v-distpicker>
          <el-input v-model="user.address" placeholder="输入详细地址"/>
        </div>
        <div v-else>
          <el-input v-model="user.address" placeholder="输入详细地址" @focus="updateAddress"/>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="saveOrUpdate">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

import userApi from '@/api/acl/user'
import VDistpicker from 'v-distpicker'

const defaultForm = {
  username: '',
  nickName: '',
  password: '',
  phone: '',
  address: '',
  backAddress: ''
}

const validatePass = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码不能小于6位'))
  } else {
    callback()
  }
}

export default {
  components: { VDistpicker },
  data() {
    return {
      user: defaultForm,
      saveBtnDisabled: false, // 保存按钮是否禁用,
      showAddress: false,
      validateRules: {
        username: [{ required: true, trigger: 'blur', message: '用户名必须输入' }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }]
      },
      placeholders: {
        province: '省份/自治区',
        city: '城市/地区/自治州',
        area: '区/县'
      },
      addressDetail: ''
    }
  },

  // 监听器
  watch: {
    $route(to, from) {
      console.log('路由变化......')
      console.log(to)
      console.log(from)
      this.init()
    }
  },

  // 生命周期方法（在路由切换，组件不变的情况下不会被调用）
  created() {
    console.log('form created ......')
    this.init()
  },

  methods: {

    // 表单初始化
    init() {
     // debugger
      if (this.$route.params && this.$route.params.id) {
        const id = this.$route.params.id
        this.fetchDataById(id)
      } else {
        // 对象拓展运算符：拷贝对象，而不是赋值对象的引用
        this.user = { ...defaultForm }
      }
    },

    saveOrUpdate() {
      this.$refs.user.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true // 防止表单重复提交
          if (!this.user.id) {
            this.saveData()
          } else {
            this.updateData()
          }
        }
      })
    },

    showDetailAddress() {
      this.showAddress = false
    },
    updateAddress() {
      this.showAddress = true
      this.user.address = ''
    },
    selectedAddress(data) {
      console.log(data.area.value)
      console.log(data.province.value)
      console.log(data.city.value)
      this.addressDetail = data.province.value + data.city.value + data.area.value
    },
    // 新增讲师
    saveData() {
      this.user.address = this.addressDetail + this.user.address
      //console.log(this.user.address)
      userApi.save(this.user).then(response => {
        // debugger
        if (response.success) {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.$router.push({ path: '/acl/user/list' })
        }
      })
    },

    // 根据id更新记录
    updateData() {
      // 更新地址值
      this.user.address = this.addressDetail + this.user.address
      // teacher数据的获取
      userApi.updateById(this.user).then(response => {
        if (response.success) {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.$router.push({ path: '/acl/user/list' })
        }
      })
    },

    // 根据id查询记录
    fetchDataById(id) {
      userApi.getById(id).then(response => {
       // debugger
        this.user = response.data.item
      })
    }

  }
}
</script>
