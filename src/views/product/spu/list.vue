<template>
  <div class="app-container">

    <!--三级下拉列表-->
    <CatalogSelector v-show="!showSkuForm" @listenOnSelect="getSpuList" />

    <!--spu列表-->
    <div v-show="!showSpuForm && !showSkuForm && !showUpdateInfo">
      <div style="margin-bottom:10px;">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addSpu()">添加SPU</el-button>
      </div>

      <el-table
        v-loading="spuListLoading"
        :data="spuList"
        element-loading-text="数据正在加载......"
        border
        fit
        highlight-current-row>
        <el-table-column align="center" label="序号" width="100">
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="商品id" width="100">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="商品名称" width="300">
          <template slot-scope="scope">
            <span>{{ scope.row.spuName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品描述">
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addSku(scope.row.id, scope.row.spuName)">添加SKU</el-button>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateSpu(scope.row.id, scope.row.spuName, scope.row.description)">修改</el-button>
            <el-button type="primary" size="mini" icon="el-icon-delete" @click="deleteSpu(scope.row.id)">删除</el-button>
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

    <!--  修改属性值  -->
    <el-form v-show="showUpdateInfo" :model="spuInfo" :inline="true" class="demo-ruleForm" >
      <div>
        <span>修改spu</span>
        <el-divider></el-divider>
      </div>

      <el-form-item label="商品名称" prop="spuName">
        <el-input v-model="spuInfo.spuName" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="商品描述" prop="description">
        <el-input v-model="spuInfo.description" style="width: 830px"/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="modifySpuInfo(spuInfo)">更改</el-button>
        <el-button type="default" @click="backToSpuList()">返回</el-button>
      </el-form-item>
    </el-form>

    <!--spu表单-->
    <SpuForm
      v-show="showSpuForm"
      ref="spuForm"
      :catalog-id="catalogId"
      @listenOnSave="onSpuSave()"
      @listenOnClose="onSpuClose()"/>

    <!--sku表单-->
    <SkuForm
      v-show="showSkuForm"
      ref="skuForm"
      :catalog-id="catalogId"
      :spu-id="selectedSpu.spuId"
      :spu-name="selectedSpu.spuName"
      @listenOnSave="onSkuSave()"
      @listenOnClose="onSkuClose()"/>

  </div>
</template>

<script>
import spu from '@/api/product/spu'
import CatalogSelector from '@/views/components/CatalogSelector'
import SpuForm from '@/views/product/components/SpuForm'
import SkuForm from '@/views/product/components/SkuForm'

export default {
  components: { CatalogSelector, SpuForm, SkuForm },

  data() {
    return {

      // spu所属分类
      catalogId: null,

      // spu列表数据
      spuList: null,
      spuListLoading: false,

      // spu表单显示
      showSpuForm: false,

      // sku表单显示
      showSkuForm: false,
      showUpdateInfo: false,

      // 选中的spu
      selectedSpu: {
        spuId: null,
        spuName: null
      },
      spuInfo: {
        id: null,
        spuName: null,
        description: null
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

    // 加载讲师列表数据
    fetchData(page = 1) {
      console.log('翻页。。。' + page)
      // 异步获取远程数据（ajax）
      this.page = page
      this.getSpuList(this.catalogId)
    },
    // 获取spu列表
    getSpuList(catalogId) {
      this.catalogId = catalogId
      // 查询数据
      this.spuListLoading = true
      spu.getSpuList(this.catalogId, this.page, this.limit).then(response => {
        this.spuList = response.data.rows
        this.total = response.data.total
        this.spuListLoading = false
      })
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

    // 添加spu
    addSpu() {
      if (!this.confirmSelect()) {
        return
      }

      // 初始化表单
      this.$refs.spuForm.init()

      // 显示表单
      this.showSpuForm = true
    },

    // 保存spu后刷新列表
    onSpuSave() {
      // 刷新Spu列表
      this.getSpuList(this.catalogId)

      // 隐藏表单
      this.showSpuForm = false
    },

    // 关闭spu表单
    onSpuClose() {
      // 隐藏表单
      this.showSpuForm = false
    },

    // 添加sku
    addSku(spuId, spuName) {
      this.selectedSpu.spuId = spuId
      this.selectedSpu.spuName = spuName

      // 初始化表单
      this.$refs.skuForm.init(spuId)

      // 显示表单
      this.showSkuForm = true
    },

    // 保存sku
    onSkuSave() {
      // 隐藏表单
      this.showSkuForm = false
    },

    // 关闭sku表单
    onSkuClose() {
      // 隐藏表单
      this.showSkuForm = false
    },

    updateSpu(id, name, desc) {
      this.spuInfo.id = id
      this.spuInfo.spuName = name
      this.spuInfo.description = desc
      this.showUpdateInfo = true
    },

    deleteSpu(id) {

    },
    modifySpuInfo(spuInfo) {
      //console.log(spuInfo)
      spu.updateSpu(spuInfo).then(response => {
        setTimeout(this.backToSpuList(), 5000)
      })
    },
    backToSpuList() {
      this.showSpuForm = false
      this.showSkuForm = false
      this.showUpdateInfo = false
      // 重新刷新页面
      this.getSpuList(this.catalogId);
    }
  }
}
</script>
