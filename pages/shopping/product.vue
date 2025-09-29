<template>
	<view class="product_body">
		<view class="addproductbox">
			<view class="addtitlebox">
				商品管理
			</view>

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

			<view class="showdatabox">
				<uni-table border stripe>
					<uni-tr>
						<uni-th width="150" align="center">商品名称</uni-th>
						<uni-th width="150" align="center">商品分类</uni-th>
						<uni-th width="150" align="center">商品售价</uni-th>
						<uni-th width="204" align="center">商品库存</uni-th>
						<uni-th width="204" align="center">操作</uni-th>
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
				<view>{{popuptitle}}</view>
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
							<uni-data-select v-model="productdata.product_category"
								:localdata="categorylist"></uni-data-select>
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
					<uni-forms-item label="商品变体">
						<scroll-view style="height: 140px; overflow-y: auto;" scroll-y="true">
							<view style="height: 140px;">
								<view v-for="(variant, index) in productdata.variants" :key="index" class="variant-row">
									<!-- 变体属性 -->
									<view class="little_input">
										<uni-easyinput v-model="variant.name" placeholder="如：红色-XL"
											class="variant-input" />
									</view>
									<!-- 价格 -->
									<view class="little_input">
										<uni-easyinput v-model="variant.price" type="number" placeholder="价格"
											class="variant-input" />
									</view>
									<!-- 库存 -->
									<view class="little_input">
										<uni-easyinput v-model="variant.stock" type="number" placeholder="库存"
											class="variant-input" />
									</view>
									<!-- 删除按钮 -->
									<button type="warn" size="mini" @click="removeVariant(index)">删除</button>

								</view>
								<button type="primary" @tap="addVariant" size="mini">+ 添加变体</button>

							</view>
						</scroll-view>

					</uni-forms-item>
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

		<!-- <uni-popup ref="delpopup">
			<view class="delpopupbox">
				<view>删除确认</view>
				<div class="form_btnbox">
					<button type="primary" size="mini" @click="">删除</button>
					<button type="primary" size="mini" @click="closeaddbox">取消</button>
				</div>
			</view>
		</uni-popup> -->
		<uni-popup ref="delpopup" type="dialog">
			<uni-popup-dialog :type="msgType" cancelText="关闭" confirmText="同意" title="通知" content="是否删除该商品"
				@confirm="delproduct" @close="closeaddbox"></uni-popup-dialog>
		</uni-popup>


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
					}, ],
					image: [],
					islist: true
				},
				popuptitle: '',
				products: [],
				seldelid: null,
				isadd: true
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
				this.popuptitle = '添加商品'
				this.$refs.popup.open();
			},
			closeaddbox() {
				this.$refs.popup.close()
				this.$refs.delpopup.close();
			},
			removeVariant(index) {
				this.productdata.variants.splice(index, 1);
			},
			addVariant() {
				var data = {
					name: '',
					price: '',
					stock: '',
					image: ''
				};
				this.productdata.variants.push(data)
			},
			handleUploadSuccess(res) {
				if (res.tempFiles && res.tempFiles.length > 0) {
					// 遍历所有上传成功的文件
					res.tempFiles.forEach(file => {
						// 只处理上传成功的文件
						if (file.status === 'success' && file.url) {
							// 将图片链接添加到数组中
							// this.productdata.image.push(file.url);
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
						data: {
							productdata: this.productdata
						}
					})
					console.log(result)
					if (result.result.success) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						// 可以在这里进行页面跳转等操作
					} else {
						uni.showToast({
							title: result.result.message || '保存失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('调用云函数失败：', err)
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					})
				}
			},
			async handleDelFile(e) {
				const fileid = this.productdata.image[e.index].url;
				const res = await uniCloud.callFunction({
					name: 'delete-cloud-file',
					data: {
						fileList: [fileid] // 传入文件URL或fileID
					}
				});

				if (res.code == -1) {
					uni.showToast({
						title: "云端图片删除失败",
						icon: 'error'
					});
				}
			},
			async getcategory() {
				try {
					const request = await uniCloud.callFunction({
						name: 'selCategory',
						data: {
							key: this.key || null
						}
					});
					console.log(request)
					if (request.result && request.result.success) {
						this.categorylist = (request.result.data || []).map(item => {
							return {
								value: item.id,
								text: item.categorize_name
							}
						});
						this.selcategorylist = {
							...this.categorylist
						}
					} else {
						uni.showToast({
							title: request.result?.message || '查询失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('查询错误:', err);
					uni.showToast({
						icon: 'error',
						title: err.message || '查询失败'
					});
				}
			},
			searchproduct() {
				// 调用云函数
				uniCloud.callFunction({
					name: 'selproduct',
					data: {
						key: this.key,
						category: this.searchcategory
					}
				}).then(res => {
					console.log('查询结果：', res.result)
					if (res.result.code === 0) {
						this.products = res.result.data.products
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						})
					}
				}).catch(err => {
					console.error('调用失败：', err)
				})
			},
			getCategoryText(id) {
				// 如果分类列表不存在，直接返回原始ID
				if (!this.categorylist || this.categorylist.length === 0) {
					return id;
				}

				// 在分类列表中查找匹配的项
				const category = this.categorylist.find(item => item.value === id);

				// 返回找到的文本或原始ID
				return category ? category.text : id;
			},
			opendeltipbox(item) {
				// console.log(item);
				this.seldelid = item._id;
				this.$refs.delpopup.open();
			},
			delproduct() {
				uniCloud.callFunction({
					name: 'delproduct',
					data: {
						id: this.seldelid,
					}
				}).then(res => {
					if (res.result.code === 0) {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'error'
						})
					}
				}).catch(err => {
					uni.showToast({
						title: res.result.message,
						icon: 'error'
					})
				});

				this.searchproduct();
			},
			openreproductbox(item) {
				console.log(item)
				this.isadd = false;
				this.productdata._id = item._id;
				this.productdata.product_name = item.product_name;
				this.productdata.describe = item.describe;
				this.productdata.product_category = item.product_category;
				this.productdata.price = item.price;
				this.productdata.inventory = item.inventory;
				this.productdata.variants = item.variants;
				this.productdata.image = item.image;
				this.productdata.islist = item.islist;
				this.popuptitle = '修改商品';
				this.$refs.popup.open();
			},
			reproductdata() {
				uniCloud.callFunction({
					name: 'reproduct',
					data: {
						productData : this.productdata
					}
				}).then(res => {
					this.closeaddbox();
					if (res.result.code === 0) {
						uni.showToast({
							title: res.result.msg,
							icon: 'none'
						});
						this.searchproduct();
					} else {
						uni.showToast({
							title: res.result.msg,
							icon: 'error'
						})
					}
				}).finally(err => {
				uni.showToast({
					title: res.result.msg,
					icon: 'error'
				})
			})
		}

	}
	}
</script>

<style scoped>
	.product_body {
		border: 1px solid red;
		/* height: 80vh; */
	}

	.addproductbox {
		/* width: 80vw; */
		border: 1px solid blue;
		border-radius: 10px;
	}

	.addtitlebox {
		font-size: 22px;
		margin-left: 2vw;
	}

	.formbox {
		width: 100%;
		/* border: 1px solid red; */
		padding-left: 2vw;
		/* margin-top: 2vh; */
		background-color: whitesmoke;
		padding: 10px 10px;
		border-radius: 10px;
	}

	.delpopupbox {
		/* width: 60%; */
		height: 80px;
		background-color: whitesmoke;
		padding: 10px 10px;
		border-radius: 10px;
	}

	.forminput {
		width: 40vw;
	}

	.variant-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		/* border: 1px solid red; */
		margin-top: 5px;
	}

	.little_input {
		width: 10vw;
		/* border: 1px solid red; */
	}

	.form_btnbox {
		display: flex;
		flex-direction: row;
		margin-bottom: 2vh;
	}

	.databox {
		border: 1px solid yellow;
	}

	.searchbox {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.searchlittlebox {
		width: 160px;
	}

	.tablebox {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	/* 防止label换行的样式 */
	::v-deep .uni-forms-item__label {
		white-space: nowrap;
		/* 关键属性：禁止换行 */
		overflow: hidden;
		text-overflow: ellipsis;
		/* 可以根据需要调整label宽度 */
		min-width: 140rpx;
	}

	/* 确保表单项在一行显示 */
	::v-deep .uni-forms-item {
		display: flex;
		align-items: center;
	}

	/* 媒体查询 - 手机端适配（屏幕宽度 < 768px） */
	@media (max-width: 767px) {
		.product_body {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.addproductbox {
			margin-top: 2vh;
		}
	}
</style>