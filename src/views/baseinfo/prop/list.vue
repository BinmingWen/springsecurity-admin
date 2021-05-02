<template>
  <div class="app-container">

    <!--三级下拉列表-->
    <CatalogSelector @listenOnSelect="getAttrInfoList"/>

    <!--属性列表-->
    <div v-show="!showAttrInfoForm">
      <div style="margin-bottom:10px;">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAttrInfo()">添加平台属性</el-button>
      </div>

      <el-table
        v-loading="attrInfoListLoading"
        :data="attrInfoList"
        element-loading-text="数据正在加载......"
        border
        fit
        highlight-current-row>
        <el-table-column align="center" label="序号" width="100">
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="属性id" width="100">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="属性名称">
          <template slot-scope="scope">
            <span>{{ scope.row.attrName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="500" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-caret-right"
                       @click="editAttrInfoById(scope.row.id, scope.row.attrName)">更新属性值
            </el-button>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateAttrInfo(scope.row.id,scope.row.attrName)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :total="total"
        :page-size="limit"
        :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
        style="padding: 30px 0; text-align: center;"
        layout="sizes, prev, pager, next, jumper, ->, total, slot"
        @current-change="fetchData"
        @size-change="changeSize"
      />

    </div>

    <!--属性表单-->
    <el-form v-show="showAttrInfoValueForm" :model="attrInfoForm" :inline="true" class="demo-form-inline">

      <el-form-item label="属性名称">
        <el-input v-model="attrInfoForm.attrName"/>
      </el-form-item>

      <div style="margin-bottom:10px;">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAttrValue()">添加属性值</el-button>

      </div>
      <div>
        <el-table
          v-loading="attrValueListLoading"
          :data="attrInfoForm.attrValueList"
          element-loading-text="数据正在加载......"
          border
          fit
          highlight-current-row>
          <el-table-column align="center" label="序号" width="100">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="属性值id" width="100">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="属性值名称">
            <!-- <template slot-scope="scope">
              <span>{{ scope.row.valueName }}</span>
            </template> -->
            <template slot-scope="scope">
              <el-input
                v-if="showInput"
                v-model="scope.row.valueName"
                class="edit-input"
                size="mini"
                @keyup.enter.native="saveAttrValue()"
                @blur="saveAttrValue()"/>
              <span
                v-else
                @click="editAttrValue">{{ scope.row.valueName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" icon="el-icon-edit"
                         @click="deleteAttrValueByName(scope.row.valueName, scope.row.id)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!--查询按钮-->
      <div style="margin-top:22px;">
        <el-button type="primary" size="mini" @click="saveAttrInfo()">保存</el-button>
        <el-button type="default" size="mini" @click="backToAttrList()">返回</el-button>
      </div>
    </el-form>
<!--  修改属性值  -->
    <el-form v-show="showUpdateInfo" :model="attrInfo" :inline="true" class="demo-form-inline" >
      <div>
        <span>修改属性名称</span>
        <el-divider/>

      </div>

      <el-form-item label="属性值名称" prop="attrName">
        <el-input v-model="attrInfo.attrName"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="modifyAttrInfo(attrInfo)">更改</el-button>
        <el-button type="default" @click="backToAttrList()">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import prop from '@/api/baseinfo/prop'
import CatalogSelector from '@/views/components/CatalogSelector'

export default {
  components: { CatalogSelector },
  data() {
    return {

      // 属性所属分类
      catalogId: null,

      // 属性列表数据
      attrInfoList: null,
      attrInfoListLoading: false,
      showAttrInfoValueForm: false,
      // 显示更新列表
      showUpdateInfo: false,

      // 属性表单数据
      showAttrInfoForm: false,
      attrValueListLoading: false,
      attrInfoForm: {
        id: null,
        attrName: null,
        catalog3Id: null,
        attrValueList: []
      },
      showInput: false,

      attrInfo: {
        id: null,
        attrName: null,
        catalog3Id: null
      },

      //分页数据变量
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 10 // 每页记录数

    }
  },

  methods: {

    // 当页码发生改变的时候
    changeSize(size) {
      console.log(size)
      this.limit = size
      this.fetchData(1)
    },

    // 获取属性列表
    fetchData(page = 1) {
      console.log('翻页。。。' + page)
      // 异步获取远程数据（ajax）
      this.page = page
      this.getAttrInfoList(this.catalogId)
    },

    // 获取属性列表
    getAttrInfoList(catalogId) {
      this.catalogId = catalogId
      // 查询数据
      this.attrInfoListLoading = true
      prop.getAttrInfoList(this.catalogId, this.page, this.limit).then(response => {
        this.attrInfoList = response.data.rows
        this.total = response.data.total
        this.attrInfoListLoading = false
      })
    },

    // 添加平台属性
    addAttrInfo() {
      if (!this.confirmSelect()) {
        return
      }

      debugger

      // 初始化值
      this.attrInfoForm.id = null
      this.attrInfoForm.attrName = null
      this.attrInfoForm.attrValueList = []

      // 显示表单 showAttrInfoForm
      this.showAttrInfoValueForm = true
      this.showAttrInfoForm = true
    },

    // 选择三级分类确认
    confirmSelect() {
      if (!this.catalogId) {
        this.$alert('请选择三级分类', '提示', {
          confirmButtonText: '确定',
          type: 'warning'
        })
        return false
      }
      return true
    },

    // 修改属性
    editAttrInfoById(attrId, attrName) {
      // 获取属性值列表
      this.attrValueListLoading = true
      prop.getAttrValueList(attrId).then(response => {
        this.attrInfoForm.id = attrId
        this.attrInfoForm.attrName = attrName
        this.attrInfoForm.attrValueList = response.data
        this.attrValueListLoading = false
      })
      // 显示表单
      this.showAttrInfoForm = true
      this.showAttrInfoValueForm = true
      this.showUpdateInfo = false
    },

    // 删除属性值
    deleteAttrValueByName(attrValueName, id) {
      const tempList = []
      this.attrInfoForm.attrValueList.forEach(attrValue => {
        if (attrValue.valueName !== attrValueName) {
          tempList.push(attrValue)
        }
      })
      prop.deleteAttrValue(id).then(response => {
          // console.log(' 删除成功！')
        }
      )
      this.attrInfoForm.attrValueList = tempList
    },

    // 保存属性和属性值
    saveAttrInfo() {
      this.attrInfoForm.catalog3Id = this.catalogId
      prop.saveAttrInfo(this.attrInfoForm).then(response => {
        setTimeout(this.backToAttrList(), 5000)
      })
    },

    // 返回属性列表页面
    backToAttrList() {
      // 隐藏表单

      this.showAttrInfoForm = false
      this.showAttrInfoValueForm = false
      this.showUpdateInfo = false
      this.getAttrInfoList(this.catalogId)
    },

    // 添加属性值
    addAttrValue() {
      const attrValue = {
        valueName: null,
        edit: true
      }
      this.attrInfoForm.attrValueList.push(attrValue)
      this.showInput = true
    },

    // 保存属性值
    saveAttrValue() {
      this.showInput = false
    },

    // 编辑属性值
    editAttrValue() {
      this.showInput = true
    },
    updateAttrInfo(id, attrName) {
      this.showUpdateInfo = true
      this.attrInfo.id = id
      this.attrInfo.attrName = attrName
      this.attrInfo.catalog3Id = this.catalogId

      // 显示表单
      this.showAttrInfoForm = true
      this.showAttrInfoValueForm = false
    },
    deleteAttrInfo(id) {

    },
    modifyAttrInfo(attrInfo) {
      // debugger

      prop.updateAttrInfoName(attrInfo).then( response => {
        setTimeout(this.backToAttrList(), 5000)
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 60px;
}

.save-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

</style>

