<template>
	<view class="bodybox">
		<view class="bodytitle">商品分类设置</view>

		<view class="selcategorizedatabox">
			<view class="searchbox">
				<view class="searchbox_title">分类名称</view>
				<view class="searchbox_input">
					<uni-easyinput v-model="key" placeholder="请输入关键词"></uni-easyinput>
				</view>
				<view class="searchbox_btn">
					<button type="primary" size="mini" @click="searchbtn">搜索</button>
				</view>
			</view>
			<view class="databox">
				<!-- 表格容器 -->
				<view class="table-container">
					<!-- 表头（固定） -->
					<view class="table-header">
						<view class="table-cell">序号</view>
						<view class="table-cell">分类名称</view>
						<view class="table-cell">排序号</view>
						<view class="table-cell hide-on-mobile">创建时间</view>
						<view class="table-cell">操作</view>
					</view>

					<!-- 表格内容（可滚动） -->
					<view class="table-body-scroll">
						<view class="table-body">
							<!-- 无数据时显示 -->
							<view class="no-data" v-if="categoryList.length === 0">
								暂无数据
							</view>

							<!-- 数据列表 -->
							<view class="table-row" v-for="(item, index) in categoryList" :key="item._id">
								<view class="table-cell">{{ index + 1 }}</view>
								<view class="table-cell">{{ item.categorize_name }}</view>
								<view class="table-cell">{{ item.num }}</view>
								<view class="table-cell hide-on-mobile">{{ formatTime(item.create_time) }}</view>
								<view class="table-cell operation-cell">
									<button type="primary" size="mini" class="edit-btn" @click="handleEdit(item)">
										修改
									</button>
									<button type="warn" size="mini" class="delete-btn" @click="handleDelete(item)">
										删除
									</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 修改分类弹窗 -->
		<uni-popup ref="editVisible" mode="center">
			<view class="popup-box">
				<view class="popup-title">修改分类</view>
				<view class="popup-linebox">
					<view class="popup-title">分类名称：</view>
					<view class="popup-inputbox">
						<uni-easyinput v-model="editForm.categorize_name" placeholder="请输入分类名称"></uni-easyinput>
					</view>
				</view>
				<view class="popup-linebox">
					<view class="popup-title">分类顺序：</view>
					<view class="popup-inputbox">
						<uni-easyinput v-model="editForm.num" placeholder="请输入顺序值"></uni-easyinput>
					</view>
				</view>
				<view class="popup-btns">
					<button type="default" size="mini" @click="closepopup">取消</button>
					<button type="primary" size="mini" @click="confirmEdit">修改</button>
				</view>
			</view>
		</uni-popup>

		<view class="setcategorizebox">
			<view class="set_title">添加新分类</view>
			<view class="add_linebox">
				<view class="add_little_title">
					分类名称：
				</view>
				<view class="inputbox">
					<uni-easyinput v-model="value" placeholder="请输入分类名称"></uni-easyinput>
				</view>

			</view>
			<view class="add_linebox">
				<view class="add_little_title">
					分类顺序：
				</view>
				<view class="inputbox">
					<uni-easyinput v-model="soltnum" placeholder="请输入顺序值"></uni-easyinput>
				</view>
			</view>
			<view class="add_linebox">
				<button type="primary" size="mini" @click="addCategory">添加</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		request
	} from '../../js_sdk/uni-admin/request';

	export default {
		data() {
			return {
				value: '',
				soltnum: '',
				key: '',
				categoryList: [],
				editVisible: false,
				editForm: { // 修改表单数据
					_id: '',
					categorize_name: '',
					num: ''
				}
			}
		},
		methods: {
			// 时间格式化
			formatTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}:${this.padZero(date.getSeconds())}`;
			},
			// 数字补零
			padZero(num) {
				return num < 10 ? '0' + num : num;
			},
			// 搜索功能
			async searchbtn() {
				try {
					const request = await uniCloud.callFunction({
						name: 'selCategory',
						data: {
							key: this.key || null
						}
					});

					if (request.result && request.result.success) {
						this.categoryList = request.result.data || [];
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
			// 添加分类
			async addCategory() {
				// 表单验证
				if (!this.value.trim()) {
					uni.showToast({
						title: '请输入分类名称',
						icon: 'none'
					});
					return;
				}
				if (!this.soltnum.trim()) {
					uni.showToast({
						title: '请输入排序号',
						icon: 'none'
					});
					return;
				}

				try {
					const request = await uniCloud.callFunction({
						name: 'addCategory',
						data: {
							categorize_name: this.value,
							num: this.soltnum
						}
					});

					if (request.result && request.result.success) {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});
						this.searchbtn(); // 刷新列表
						this.value = '';
						this.soltnum = '';
					} else {
						uni.showToast({
							title: request.result?.message || '添加失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('添加错误:', error);
					uni.showToast({
						icon: 'error',
						title: error.message || '添加失败'
					});
				}
			},
			handleEdit(item) {
				// 打开弹窗并填充数据
				this.editForm = {
					_id: item._id,
					categorize_name: item.categorize_name,
					num: item.num
				};
				this.$refs.editVisible.open('center')
			},
			closepopup() {
				this.$refs.editVisible.close();
			},
			async confirmEdit() {
				try {
					const request = await uniCloud.callFunction({
						name: 'updateCategory',
						data: {
							_id: this.editForm._id,
							categorize_name: this.editForm.categorize_name,
							num: this.editForm.num
						}
					});
					console.log(request);

					if (request.result && request.result.success) {
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						});
						this.closepopup();
						this.searchbtn(); // 刷新列表
						this.value = '';
						this.soltnum = '';
					} else {
						uni.showToast({
							title: request.result?.message || '修改失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('修改错误:', err);
					uni.showToast({
						icon: 'error',
						title: err.message || '修改失败'
					});
				}
			},
			async handleDelete(item) {
				try {
					const request = await uniCloud.callFunction({
						name: 'deleteCategory',
						data: {
							_id: item._id
						}
					});

					console.log(request);

					// 处理云函数返回结果
					if (request.result && request.result.success) {
						uni.showToast({
							title: '删除成功',
							icon: 'success',
							duration: 2000
						});
						// 刷新列表
						this.searchbtn();
					} else {
						uni.showToast({
							title: request.result?.message || '删除失败',
							icon: 'none',
							duration: 2000
						});
					}

				} catch (error) {
					console.error('修改错误:', error);
					uni.showToast({
						icon: 'error',
						title: error.message || '修改失败'
					});
				}
			}
		},
		// 页面加载时查询数据
		onLoad() {
			this.searchbtn();
		}
	}
</script>

<style>
	/* 基础样式 - 所有设备共用 */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	}

	.bodybox {
		width: 100%;
		max-width: 1200px;
		/* 电脑端最大宽度 */
		min-width: 320px;
		/* 手机端最小宽度 */
		margin: 0 auto;
		padding: 15px;
		background-color: #fff;
		min-height: 100vh;
	}

	.bodytitle {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1.2rem;
		color: #333;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid #eee;
	}

	.selcategorizedatabox {
		width: 100%;
		margin-bottom: 1.2rem;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 15px;
		background-color: #fff;
	}

	.searchbox {
		display: flex;
		flex-direction: row;

		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		/* 自动换行适配小屏幕 */
		gap: 10px;
		/* 元素间距 */
	}

	.searchbox_title {
		font-size: 1rem;
		color: #666;
		white-space: nowrap;
		/* 防止标题换行 */
	}

	.searchbox_input {
		flex: 1;
		min-width: 160px;
		/* 输入框最小宽度 */
	}

	.searchbox_btn button {
		white-space: nowrap;
	}

	.setcategorizebox {
		width: 100%;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 15px;
		background-color: #fff;
	}

	.set_title {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		color: #333;
		font-weight: 500;
	}

	.add_linebox {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 10px;
	}

	.add_little_title {
		width: 100px;
		font-size: 1rem;
		color: #666;
		text-align: right;
		padding-right: 10px;
		box-sizing: border-box;
		white-space: nowrap;
	}

	.inputbox {
		flex: 1;
		min-width: 200px;
	}

	/* 表格样式 */
	.table-container {
		width: 100%;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		overflow: hidden;
	}

	.table-header {
		display: flex;
		background-color: #f8f9fa;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.table-body-scroll {
		max-height: 400px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.table-body .table-row {
		display: flex;
		border-bottom: 1px solid #e5e5e5;
	}

	.table-body .table-row:hover {
		background-color: #f8f9fa;
	}

	.table-body .table-row:last-child {
		border-bottom: none;
	}

	.table-cell {
		flex: 1;
		padding: 12px 8px;
		text-align: center;
		font-size: 0.9rem;
		word-wrap: break-word;
		word-break: break-all;
	}

	.table-header .table-cell {
		font-weight: 500;
		color: #333;
	}

	.table-body .table-cell {
		color: #555;
	}

	.no-data {
		padding: 30px 0;
		text-align: center;
		color: #999;
		font-size: 1rem;
	}

	/* 滚动条样式 */
	.table-body-scroll::-webkit-scrollbar {
		width: 6px;
	}

	.table-body-scroll::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.table-body-scroll::-webkit-scrollbar-thumb {
		background: #ccc;
		border-radius: 3px;
	}

	.table-body-scroll::-webkit-scrollbar-thumb:hover {
		background: #aaa;
	}


	.popup-box {
		/* border: 1px solid red; */
		background-color: whitesmoke;
		border-radius: 10px;
	}

	.popup-linebox {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		margin: 2vh 0;
		/* border: 1px solid black; */
	}

	.popup-inputbox {
		width: 200px;
		/* border: 1px solid blue; */
	}

	.popup-title {
		/* align-items: center; */
		margin-left: 2vw;
		/* margin-top: 1vh; */
	}

	.popup-btns {
		display: flex;
		flex-direction: row;
	}

	/* 按钮样式 */
	button {
		cursor: pointer;
		padding: 5px 15px;
	}

	/* 媒体查询 - 手机端适配（屏幕宽度 < 768px） */
	@media (max-width: 767px) {
		.popup-box {
			width: 90vw;
			height: 26vh;
		}

		.bodybox {
			padding: 10px;
		}

		.bodytitle {
			font-size: 1.3rem;
			margin-bottom: 1rem;
		}

		.searchbox {
			flex-direction: row;
			align-items: center;

		}

		.searchbox_title {
			text-align: left;
			margin-bottom: 5px;
		}

		.searchbox_input {
			width: 200px;
		}

		.searchbox_btn {

			margin-top: 10px;
			text-align: right;
		}

		/* 手机端隐藏创建时间列 */
		.hide-on-mobile {
			display: none !important;
		}

		/* 操作列样式优化 */
		.operation-cell {
			flex: 0 0 120px;
			/* 固定操作列宽度 */
			display: flex;
			justify-content: center;
			gap: 3px;
		}

		.operation-cell button {
			padding: 3px 8px;
			/* 缩小按钮尺寸 */
			font-size: 0.8rem;
		}

		.add_linebox {
			flex-direction: column;
			align-items: stretch;
		}

		.add_little_title {
			text-align: left;
			width: 100%;
			margin-bottom: 5px;
		}

		/* 表格单元格调整 */
		.table-cell {
			font-size: 0.85rem;
			padding: 10px 5px;
		}

		/* 隐藏创建时间列（手机端空间不足时） */
		/* .table-header .table-cell:last-child,
		.table-row .table-cell:last-child {
			display: none;
		} */
	}

	/* 媒体查询 - 平板/电脑端（屏幕宽度 >= 768px） */
	@media (min-width: 768px) {

		.selcategorizedatabox,
		.setcategorizebox {
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
		}

		.table-container {
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		}
	}
</style>