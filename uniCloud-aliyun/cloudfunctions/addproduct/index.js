// 云函数入口文件
const db = uniCloud.database()
const dbCmd = db.command
// 引入uuid生成唯一ID
const { v4: uuidv4 } = require('uuid')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取前端传递的商品数据
    const { productdata } = event
    
    // 验证必要字段
    if (!productdata || !productdata.product_name) {
      return {
        code: 400,
        success: false,
        message: '商品名称不能为空'
      }
    }
    
    // 处理变体数据：过滤空变体并生成唯一ID（避免被空字符串覆盖）
    const filteredVariants = (productdata.variants || []).filter(variant => {
      const isEmpty = Object.keys(variant).every(key => {
        const value = variant[key]
        return value === '' || value === null || value === undefined
      })
      return !isEmpty
    }).map(variant => {
      const vid = variant._id ? variant._id : uuidv4()
      return {
        ...variant,
        _id: vid,
        price: variant.price ? Number(variant.price) : 0,
        stock: variant.stock ? Number(variant.stock) : 0
      }
    })
    
    // 获取当前时间
    const currentTime = new Date()
    const timeStr = currentTime.toISOString()
    
    // 生成商品唯一ID
    const productId = uuidv4()

    // 避免将前端传入的空字符串 _id 覆盖掉已生成的 ID，剥离 _id 与 variants 后重建对象
    const { _id: incomingId, variants: incomingVariants, ...restProduct } = productdata || {}

    // 处理商品数据（包含自定义ID）
    const processedData = {
      ...restProduct,
      _id: incomingId ? incomingId : productId, // 优先使用有效的前端 _id，否则使用生成的 productId
      price: productdata.price ? Number(productdata.price) : 0,
      inventory: productdata.inventory ? Number(productdata.inventory) : 0,
      variants: filteredVariants, // 已包含变体ID
      createTime: timeStr,
      updateTime: timeStr
    }
    
    // 插入数据到数据库
    const result = await db.collection('products').add(processedData)
    
    return {
      code: 200,
      success: true,
      message: '商品数据保存成功',
      data: {
        id: processedData._id, // 返回自定义商品ID
        dbId: result.id, // 数据库自动生成的_id（可选）
        variantIds: filteredVariants.map(v => v._id) // 返回所有变体 _id（可选）
      }
    }
  } catch (err) {
    console.error('保存商品数据失败：', err)
    return {
      code: 500,
      success: false,
      message: '保存商品数据失败',
      error: err.message
    }
  }
}