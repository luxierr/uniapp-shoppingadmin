'use strict';
const db = uniCloud.database()
const collection = db.collection('products')
const { v4: uuidv4 } = require('uuid')

exports.main = async (event, context) => {
	// 获取客户端传入的产品数据
		const productData = event.productData;

		// 规范化变体：确保每个变体都有一个非空的 _id（支持前端可能传入的 id 字段）
		const normalizedProductData = Object.assign({}, productData || {})
		if (Array.isArray(normalizedProductData.variants)) {
			normalizedProductData.variants = normalizedProductData.variants.map(variant => {
				const v = Object.assign({}, variant)
				// 如果存在 id 字段，优先转为 _id
				if ((v._id === undefined || v._id === '') && v.id) {
					v._id = v.id
					delete v.id
				}
				// 如果仍然没有有效 _id，则生成一个新的
				if (!v._id || v._id === '') {
					v._id = uuidv4()
				}
				return v
			})
		} else {
			normalizedProductData.variants = []
		}
	
		if (!productData || !productData._id) {
		return {
			code: -1,
			msg: '缺少产品ID或产品数据'
		}
	}
	
	try {
		// 根据_id查询已有数据
		const res = await collection.doc(productData._id).get()
		
		if (res.data && res.data.length > 0) {
			// 存在相同_id的数据，进行比较
			const existingData = res.data[0];
			const updateData = {};
			
				// 遍历产品数据字段，找出不同的值（使用规范化后的数据进行比较/更新）
				for (const key in normalizedProductData) {
				// 跳过_id字段，不更新ID
				if (key === '_id') continue;
				
				// 处理数组类型的字段（如variants和image）
					if (Array.isArray(normalizedProductData[key]) && Array.isArray(existingData[key])) {
					// 数组长度不同，肯定有变化
						if (normalizedProductData[key].length !== existingData[key].length) {
							updateData[key] = normalizedProductData[key];
					} else {
						// 数组长度相同，比较内容
						let isDifferent = false;
							for (let i = 0; i < normalizedProductData[key].length; i++) {
								if (JSON.stringify(normalizedProductData[key][i]) !== JSON.stringify(existingData[key][i])) {
								isDifferent = true;
								break;
							}
						}
							if (isDifferent) {
								updateData[key] = normalizedProductData[key];
						}
					}
				} 
				// 处理对象类型的字段
					else if (typeof normalizedProductData[key] === 'object' && normalizedProductData[key] !== null && 
						 typeof existingData[key] === 'object' && existingData[key] !== null) {
						if (JSON.stringify(normalizedProductData[key]) !== JSON.stringify(existingData[key])) {
							updateData[key] = normalizedProductData[key];
					}
				} 
				// 处理基本类型字段
				else {
						if (normalizedProductData[key] !== existingData[key]) {
							updateData[key] = normalizedProductData[key];
					}
				}
			}
			
			// 如果有需要更新的字段，则执行更新操作
			if (Object.keys(updateData).length > 0) {
				await collection.doc(productData._id).update(updateData);
				return {
					code: 0,
					msg: '数据更新成功',
					updateFields: updateData
				}
			} else {
				return {
					code: 1,
					msg: '数据无变化，无需更新'
				}
			}
		} else {
			// 不存在相同_id的数据，可以选择新增或返回提示
			return {
				code: 2,
				msg: '未找到对应ID的产品数据',
				// 如果需要自动新增，可以取消下面一行的注释
				// data: await collection.add(productData)
			}
		}
	} catch (e) {
		return {
			code: -2,
			msg: '操作失败',
			error: e.message
		}
	}
};
