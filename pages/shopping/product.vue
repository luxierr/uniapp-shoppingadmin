<template>
	<view class="product_body">
		<view class="container">
			<view class="addproductbox">
				<view class="addtitlebox">商品管理</view>

				<view class="databox">
					<view class="searchbox">
						<view class="searchlittlebox">
							<uni-data-select v-model="searchcategory" :localdata="categorylist"></uni-data-select>
						</view>
						<view class="searchlittlebox">
							<uni-easyinput v-model="key" placeholder="请输入商品名称" />
						</view>
						<button type="primary" size="mini" @click="searchproduct">搜索</button>
					</view>
				</view>

				<view class="btnbox">
					<button type="primary" size="mini" @click="openaddbox">添加新商品</button>
				</view>

				<!-- 表格容器添加横向滚动 -->
				<view class="table-container">
					<uni-table border stripe>
						<uni-tr>
							<uni-th align="center">商品名称</uni-th>
							<uni-th align="center">商品分类</uni-th>
							<uni-th align="center">商品售价</uni-th>
							<uni-th align="center">商品库存</uni-th>
							<uni-th align="center">操作</uni-th>
						</uni-tr>
						<uni-tr v-for="(item, index) in products" :key="index">
							<uni-td>{{ item.product_name }}</uni-td>
							<uni-td>{{ getCategoryText(item.product_category) }}</uni-td>
							<uni-td>{{ item.price }}</uni-td>
							<uni-td>{{ item.inventory }}</uni-td>
							<uni-td>
								<div class="tablebox">
									<button type="primary" size="mini" @click="openreproductbox(item)">修改</button>
									<button type="warn" size="mini" @click="opendeltipbox(item)">删除</button>
								</div>
							</uni-td>
						</uni-tr>
					</uni-table>
				</view>
			</view>

			<uni-popup ref="popup">
				<view class="formbox">
					<view class="popup-title">{{ popuptitle }}</view>
					<uni-forms ref="baseForm" :modelValue="productdata">
						<uni-forms-item label="商品名称" required>
							<view class="forminput">
								<uni-easyinput v-model="productdata.product_name" placeholder="请输入商品名称" />
							</view>
						</uni-forms-item>
						<uni-forms-item label="商品描述" required>
							<view class="forminput">
								<uni-easyinput v-model="productdata.describe" placeholder="请输入商品详情" />
							</view>
						</uni-forms-item>
						<uni-forms-item label="商品分类" required>
							<view class="forminput">
								<uni-data-select v-model="productdata.product_category" :localdata="categorylist"></uni-data-select>
							</view>
						</uni-forms-item>
						<uni-forms-item label="商品售价" required>
							<view class="forminput">
								<uni-easyinput v-model="productdata.price" placeholder="请输入商品售价" />
							</view>
						</uni-forms-item>
						<uni-forms-item label="商品库存" required>
							<view class="forminput">
								<uni-easyinput v-model="productdata.inventory" placeholder="请输入商品库存" />
							</view>
						</uni-forms-item>
						<!-- <uni-forms-item label="商品变体">
							<scroll-view style="height: 140px; overflow-y: auto;" scroll-y="true">
								<view>
									<view v-for="(variant, index) in productdata.variants" :key="index" class="variant-row">
										<view class="little_input">
											<uni-easyinput v-model="variant.name" placeholder="如：红色-XL" class="variant-input" />
										</view>
										<view class="little_input">
											<uni-easyinput v-model="variant.price" type="number" placeholder="价格" class="variant-input" />
										</view>
										<view class="little_input">
											<uni-easyinput v-model="variant.stock" type="number" placeholder="库存" class="variant-input" />
										</view>
										<button type="warn" size="mini" @click="removeVariant(index)">删除</button>
									</view>
									<button type="primary" @tap="addVariant" size="mini">+ 添加变体</button>
								</view>
							</scroll-view>
						</uni-forms-item> -->
						<uni-forms-item label="是否上架">
							<switch :checked="productdata.islist" />
						</uni-forms-item>
						<uni-forms-item label="商品图片" required>
							<uni-section title="选择任意文件" type="line">
								<view class="example-body">
									<uni-file-picker v-model="productdata.image" limit="9" file-mediatype="all"
										title="最多选择9个文件" @success="handleUploadSuccess" @fail="handleUploadFail"
										@delete="handleDelFile"></uni-file-picker>
								</view>
							</uni-section>
						</uni-forms-item>
					</uni-forms>
					<view class="form_btnbox">
						<button type="primary" size="mini" @click="addproductdata" v-if="isadd">添加</button>
						<button type="primary" size="mini" @click="reproductdata" v-if="!isadd">修改</button>
						<button type="primary" size="mini" @click="closeaddbox">取消</button>
					</view>
				</view>
			</uni-popup>

			<uni-popup ref="delpopup" type="dialog">
				<uni-popup-dialog :type="msgType" cancelText="关闭" confirmText="同意" title="通知" content="是否删除该商品"
					@confirm="delproduct" @close="closeaddbox"></uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				key: '',
				cloudFolder: 'products/images/',
				categorylist: [],
				searchcategory: '',
				selcategorylist: [],
				productdata: {
					_id: '',
					product_name: '',
					describe: '',
					product_category: '',
					price: '',
					inventory: '',
					variants: [{
						name: '',
						price: '',
						stock: '',
						image: ''
					}],
					image: [],
					islist: true
				},
				popuptitle: '',
				products: [],
				seldelid: null,
				isadd: true,
				msgType: 'warning' // 弹窗类型
			}
		},
		onShow() {
			this.getcategory();
		},
		onLoad() {
			this.searchproduct();
		},
		methods: {
			openaddbox() {
				this.popuptitle = '添加商品';
				// 重置表单数据
				this.productdata = {
					_id: '',
					product_name: '',
					describe: '',
					product_category: '',
					price: '',
					inventory: '',
					variants: [{ name: '', price: '', stock: '', image: '' }],
					image: [],
					islist: true
				};
				this.isadd = true;
				this.$refs.popup.open();
			},
			closeaddbox() {
				this.$refs.popup.close();
				this.$refs.delpopup.close();
			},
			removeVariant(index) {
				this.productdata.variants.splice(index, 1);
			},
			addVariant() {
				this.productdata.variants.push({
					name: '',
					price: '',
					stock: '',
					image: ''
				});
			},
			handleUploadSuccess(res) {
				if (res.tempFiles && res.tempFiles.length > 0) {
					res.tempFiles.forEach(file => {
						if (file.status === 'success' && file.url) {
							console.log('图片上传成功，链接：', file.url);
						}
					});
				} else {
					console.error('上传成功但未获取到图片数据', res);
				}
			},
			handleUploadFail(err) {
				console.error('上传失败：', err);
				uni.showToast({
					title: '上传失败，请重试',
					icon: 'none'
				});
			},
			async addproductdata() {
				try {
					const result = await uniCloud.callFunction({
						name: 'addproduct',
						data: { productdata: this.productdata }
					});
					if (result.result.success) {
						uni.showToast({ title: '保存成功', icon: 'success' });
						this.closeaddbox();
						this.searchproduct();
					} else {
						uni.showToast({
							title: result.result.message || '保存失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('调用云函数失败：', err);
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			},
			async handleDelFile(e) {
				const fileid = this.productdata.image[e.index].url;
				const res = await uniCloud.callFunction({
					name: 'delete-cloud-file',
					data: { fileList: [fileid] }
				});
				if (res.code === -1) {
					uni.showToast({ title: "云端图片删除失败", icon: 'error' });
				}
			},
			async getcategory() {
				try {
					const request = await uniCloud.callFunction({
						name: 'selCategory',
						data: { key: this.key || null }
					});
					if (request.result && request.result.success) {
						this.categorylist = (request.result.data || []).map(item => ({
							value: item.id,
							text: item.categorize_name
						}));
						this.selcategorylist = { ...this.categorylist };
					} else {
						uni.showToast({
							title: request.result?.message || '查询失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('查询错误:', err);
					uni.showToast({ icon: 'error', title: err.message || '查询失败' });
				}
			},
			searchproduct() {
				uniCloud.callFunction({
					name: 'selproduct',
					data: { key: this.key, category: this.searchcategory }
				}).then(res => {
					if (res.result.code === 0) {
						this.products = res.result.data.products;
					} else {
						uni.showToast({ title: res.result.message, icon: 'none' });
					}
				}).catch(err => {
					console.error('调用失败：', err);
				});
			},
			getCategoryText(id) {
				if (!this.categorylist.length) return id;
				const category = this.categorylist.find(item => item.value === id);
				return category ? category.text : id;
			},
			opendeltipbox(item) {
				this.seldelid = item._id;
				this.$refs.delpopup.open();
			},
			delproduct() {
				uniCloud.callFunction({
					name: 'delproduct',
					data: { id: this.seldelid }
				}).then(res => {
					this.closeaddbox();
					if (res.result.code === 0) {
						uni.showToast({ title: res.result.message, icon: 'none' });
						this.searchproduct();
					} else {
						uni.showToast({ title: res.result.message, icon: 'error' });
					}
				}).catch(err => {
					uni.showToast({ title: '删除失败', icon: 'error' });
				});
			},
			openreproductbox(item) {
				this.isadd = false;
				this.productdata = { ...item };
				// 深拷贝变体数据避免引用问题
				this.productdata.variants = JSON.parse(JSON.stringify(item.variants || []));
				this.popuptitle = '修改商品';
				this.$refs.popup.open();
			},
			reproductdata() {
				uniCloud.callFunction({
					name: 'reproduct',
					data: { productData: this.productdata }
				}).then(res => {
					this.closeaddbox();
					if (res.result.code === 0) {
						uni.showToast({ title: res.result.msg, icon: 'none' });
						this.searchproduct();
					} else {
						uni.showToast({ title: res.result.msg, icon: 'error' });
					}
				}).catch(err => {
					uni.showToast({ title: '修改失败', icon: 'error' });
				});
			}
		}
	}
</script>

<style scoped>
	/* 基础样式 */
	.product_body {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 容器适配 */
	.container {
		width: 100%;
		max-width: 1200rpx;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.addproductbox {
		width: 100%;
	}

	.addtitlebox {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		color: #333;
		padding-left: 10rpx;
	}

	/* 搜索区域 */
	.searchbox {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.searchlittlebox {
		flex: 1;
		min-width: 240rpx;
	}

	/* 按钮区域 */
	.btnbox {
		margin-bottom: 20rpx;
		text-align: right;
	}

	/* 表格容器 */
	.table-container {
		overflow-x: auto;
		margin-top: 20rpx;
	}

	.tablebox {
		display: flex;
		gap: 10rpx;
		justify-content: center;
	}

	/* 弹窗表单 */
	.formbox {
		width: 90%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.popup-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.forminput {
		width: 100%;
	}

	/* 变体样式 */
	.variant-row {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		align-items: center;
		margin-top: 15rpx;
		padding: 10rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
	}

	.little_input {
		flex: 1;
		min-width: 120rpx;
	}

	.variant-input {
		width: 100%;
	}

	/* 表单按钮区域 */
	.form_btnbox {
		display: flex;
		gap: 20rpx;
		justify-content: center;
		margin-top: 30rpx;
	}

	/* 表单标签样式 */
	::v-deep .uni-forms-item__label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 160rpx;
		font-size: 26rpx;
	}

	::v-deep .uni-forms-item {
		margin-bottom: 25rpx;
	}

	::v-deep .uni-easyinput__input {
		height: 70rpx;
		font-size: 26rpx;
	}

	/* 媒体查询 - 移动端适配（≤767px） */
	@media (max-width: 767px) {
		.container {
			padding: 20rpx 15rpx;
		}

		.addtitlebox {
			font-size: 28rpx;
			margin-bottom: 20rpx;
		}

		.searchbox {
			flex-direction: column;
			align-items: stretch;
		}

		.searchlittlebox {
			width: 100%;
			margin-bottom: 15rpx;
		}

		.uni-table {
			font-size: 24rpx;
		}

		.uni-th {
			padding: 15rpx 10rpx;
			min-width: 180rpx;
		}

		.formbox {
			width: 95%;
			padding: 20rpx;
		}

		.variant-row {
			flex-direction: column;
			align-items: stretch;
		}

		.little_input {
			width: 100%;
		}
	}

	/* 媒体查询 - PC端适配（≥768px） */
	@media (min-width: 768px) {
		.uni-table {
			font-size: 28rpx;
		}

		.uni-th {
			padding: 20rpx;
		}

		.form_btnbox {
			margin-top: 40rpx;
		}
	}
</style>