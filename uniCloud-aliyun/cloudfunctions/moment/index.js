'use strict';
const db = uniCloud.database()
const collection = db.collection('moments') // 新建一个动态集合

exports.main = async (event, context) => {
  const { action, data, id } = event
  
  try {
    switch (action) {
      // 获取列表
      case 'list':
        const listRes = await collection.orderBy('publishTime', 'desc').get()
        return {
          code: 0,
          data: listRes.data
        }
        
      // 新增
      case 'add':
        const addRes = await collection.add(data)
        return {
          code: 0,
          msg: '新增成功',
          id: addRes.id
        }
        
      // 更新
      case 'update':
        const { _id, ...updateData } = data
        await collection.doc(_id).update(updateData)
        return {
          code: 0,
          msg: '更新成功'
        }
        
      // 删除
      case 'remove':
        await collection.doc(id).remove()
        return {
          code: 0,
          msg: '删除成功'
        }
        
      default:
        return {
          code: -1,
          msg: '未知操作'
        }
    }
  } catch (e) {
    console.error(e)
    return {
      code: -1,
      msg: '操作失败'
    }
  }
}