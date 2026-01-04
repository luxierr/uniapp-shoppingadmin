<template>
	<view class="posts-container">
		<!-- 左侧列表区域 -->
		<view class="left-panel">
			<view class="panel-header">
				<text class="panel-title">动态列表</text>
				<text class="count-badge">{{ postlist.length }} 条内容</text>
			</view>
			<scroll-view class="data-list" scroll-y="true">
				<view class="post-card" v-for="(item,index) in postlist" :key="index">
					<view class="post-content">{{ item.content || '无内容' }}</view>
					
					<view class="media-container">
						<view v-if="item.isimage" class="image-grid">
							<image 
								:src="line" 
								class="post-image"
								mode="aspectFill"
								v-for="(line,urlkey) in item.url" 
								:key="urlkey"
							></image>
						</view>
						<view v-if="!item.isimage" class="video-container">
							<video 
							    :src="item.url[0]" 
							    @error="videoErrorCallback" 
							    controls
							    class="post-video"
							    mode="aspectFill"
							  ></video>
						</view>
					</view>
					
					<view class="post-actions">
						<button 
							type="warn" 
							size="mini" 
							@click="delposts(item)"
							class="delete-btn"
						>
							删除
						</button>
					</view>
				</view>
				
				<view class="empty-state" v-if="postlist.length === 0">
					<text>暂无动态内容</text>
				</view>
			</scroll-view>
		</view>

		<!-- 右侧发布区域 -->
		<view class="right-panel">
			<view class="panel-header">
				<text class="panel-title">发布动态</text>
			</view>
			<view class="form-container">
				<uni-forms ref="baseForm" :modelValue="postdata">
					<uni-forms-item label="动态内容" class="form-item">
						<uni-easyinput 
							type="textarea" 
							v-model="postdata.content" 
							placeholder="请输入动态内容..." 
							class="content-input"
							:rows="5"
						/>
					</uni-forms-item>
					
					<uni-forms-item label="上传类型" class="form-item">
						<radio-group @change="handleRadioChange" class="radio-group">
							<label class="radio-item">
								<radio value="true" :checked="postdata.isimage === true" />
								<text>图片</text>
							</label>
							<label class="radio-item">
								<radio value="false" :checked="postdata.isimage === false" />
								<text>视频</text>
							</label>
						</radio-group>
					</uni-forms-item>
					
					<uni-forms-item label="上传文件" class="form-item">
						<uni-section 
							title="最多选择9张图片" 
							type="line" 
							v-if="postdata.isimage"
							class="upload-section"
						>
							<uni-file-picker 
								limit="9" 
								file-mediatype="image"
								:imageStyles="imageStyles" 
								@success="handleUploadSuccess" 
								@fail="handleUploadFail"
								@delete="handleDelFile"
								class="file-picker"
							></uni-file-picker>
						</uni-section>
						
						<uni-section 
							title="选择1个视频" 
							type="line" 
							v-if="!postdata.isimage"
							class="upload-section"
						>
							<uni-file-picker 
								limit="1" 
								file-mediatype="video" 
								@success="handleUploadSuccess" 
								@fail="handleUploadFail"
								@delete="handleDelFile"
								class="file-picker"
							></uni-file-picker>
						</uni-section>
					</uni-forms-item>
				</uni-forms>
				
				<view class="button-group">
					<button type="primary" @click="addposts" class="main-btn">发布</button>
					<button type="default" @click="cleandata" class="secondary-btn">清空</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageNum: 1,
				imageStyles: {
					"height": 120, // 边框高度
					"width": 120, // 边框宽度
				},
				postdata: {
					content: '',
					isimage: true,
					url: []
				},
				postlist: [],
				pagination: []
			}
		},
		onReady: function(res) {
			this.videoContext = uni.createVideoContext('myVideo')
		},
		onLoad() {
			this.selpostsdata();
		},
		methods: {
			handleRadioChange(e) {
				// 将字符串 "true" 或 "false" 转换为布尔值
				this.postdata.isimage = (e.detail.value === 'true');

			},
			videoErrorCallback: function(e) {
				uni.showModal({
					content: e.target.errMsg,
					showCancel: false
				})
			},
			handleUploadSuccess(res) {
				if (res.tempFiles && res.tempFiles.length > 0) {
					// 遍历所有上传成功的文件
					res.tempFiles.forEach(file => {
						// 只处理上传成功的文件
						if (file.status === 'success' && file.url) {
							// 将图片链接添加到数组中
							this.postdata.url.push(file.url);
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
			async handleDelFile(e) {
				const fileid = this.postdata.url[e.index].url;
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
			async addposts() {
				await uniCloud.callFunction({
					name: 'addposts',
					data: {
						postdata: this.postdata
					}
				}).then(res => {
					console.log('调用结果', res.result);
					if (res.result.code === 0) {
						uni.showToast({
							title: '发布成功',
							icon: 'success'
						});
						//设置未默认值
						this.postdata = {
							content: '',
							isimage: true,
							url: []
						}
					} else {
						uni.showToast({
							title: res.result.msg,
							icon: 'none'
						});
					}
				}).catch(err => {
					console.error('调用失败', err);
					uni.showToast({
						title: '调用云函数失败',
						icon: 'none'
					});
				});
			},
			async cleandata() {
				//判断是否有图片有则删除
				while (this.postdata.url.length > 0) {
					const fileID = this.postdata.url[0]; // 取第一个文件
					try {
						const res = await uniCloud.callFunction({
							name: 'delete-cloud-file',
							data: {
								fileList: fileID // 传给云函数
							}
						});

						if (res.result.code === 0) {
							console.log('删除成功', fileID);
							this.postdata.url.shift(); // 删除数组第一个元素
						} else {
							console.error('删除失败', res.result.msg);
							break; // 出错就停止
						}
					} catch (e) {
						console.error('调用云函数出错', e);
						break;
					}
				}

				//设置未默认值
				this.postdata = {
					content: '',
					isimage: true,
					url: []
				}
			},
			async selpostsdata() {
				try {
					await uniCloud.callFunction({
						name: 'selposts',
						data: {
							pageSize: 10,
							pageNum: this.pageNum
						}
					}).then(res => {
						console.log('第' + this.pageNum + '页数据', res.result.data);
						this.postlist = res.result.data
						this.pagination = res.result.pagination
					});
				} catch (e) {
					console.log(e);
				}
			},
			delposts(row) {
				uni.showModal({
					title: '提示',
					content: '是否删除该动态？',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						console.log(row._id)
						uniCloud.callFunction({
							name: 'delposts',
							data:{
								_id: row._id
							}
						}).then(res => {
							if (res.result.code === 0) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
								// 刷新列表
								this.selpostsdata();
							} else {
								uni.showToast({
									title: res.result.msg,
									icon: 'none'
								});
							}
						}).catch(err => {
							console.error('调用云函数失败', err);
							uni.showToast({
								title: '调用云函数失败',
								icon: 'none'
							});
						});

					}
				});
			}
		}
	}
</script>

<style scoped>
/* 基础样式重置 */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.posts-container {
	display: flex;
	height: 100vh;
	background-color: #f5f7fa;
	overflow: hidden;
}

/* 左侧面板样式 */
.left-panel {
	width: 45%;
	height: 100%;
	border-right: 1px solid #e5e7eb;
	background-color: #fff;
	overflow: hidden;
}

/* 右侧面板样式 */
.right-panel {
	width: 55%;
	height: 100%;
	background-color: #fff;
	overflow: hidden;
}

/* 面板标题栏 */
.panel-header {
	padding: 16px 20px;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.panel-title {
	font-size: 18px;
	font-weight: 600;
	color: #1d2129;
}

.count-badge {
	font-size: 14px;
	color: #86909c;
	background-color: #f2f3f5;
	padding: 2px 8px;
	border-radius: 12px;
}

/* 列表区域 */
.data-list {
	height: calc(100% - 60px);
	padding: 16px;
}

.post-card {
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	padding: 16px;
	margin-bottom: 16px;
	transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content {
	font-size: 15px;
	color: #1d2129;
	line-height: 1.6;
	margin-bottom: 12px;
	word-break: break-all;
}

/* 媒体内容容器 */
.media-container {
	margin-bottom: 12px;
	border-radius: 4px;
	overflow: hidden;
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.post-image {
	width: 80px;
	height: 80px;
	border-radius: 4px;
	object-fit: cover;
}

.video-container {
	width: 100%;
	max-height: 200px;
}

.post-video {
	width: 100%; /* 或具体宽度，如 300px */
	height: 200px; /* 确保高度足够显示 */
	object-fit: cover; /* 配合 mode="aspectFill" 保持比例 */
}

/* 操作按钮 */
.post-actions {
	display: flex;
	justify-content: flex-end;
}

.delete-btn {
	border-radius: 4px;
	font-size: 14px;
	padding: 4px 10px;
}

/* 空状态 */
.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	color: #86909c;
	font-size: 16px;
	background-color: #f7f8fa;
	border-radius: 8px;
}

/* 表单容器 */
.form-container {
	padding: 20px;
	height: calc(100% - 60px);
	overflow-y: auto;
}

.form-item {
	margin-bottom: 20px;
}

/* 输入框样式 */
.content-input {
	width: 100%;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
	padding: 10px;
	font-size: 15px;
}

/* 单选框组 */
.radio-group {
	display: flex;
	gap: 20px;
	padding: 8px 0;
}

.radio-item {
	display: flex;
	align-items: center;
	gap: 6px;
	color: #1d2129;
}

/* 上传区域 */
.upload-section {
	margin-top: 8px;
}

.file-picker {
	width: 100%;
}

/* 按钮组 */
.button-group {
	display: flex;
	gap: 16px;
	margin-top: 30px;
}

.main-btn, .secondary-btn {
	flex: 1;
	height: 44px;
	border-radius: 6px;
	font-size: 16px;
}

.main-btn {
	background-color: #007aff;
	color: #fff;
}

.secondary-btn {
	background-color: #f5f7fa;
	color: #1d2129;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.posts-container {
		flex-direction: column;
	}
	
	.left-panel, .right-panel {
		width: 100%;
		height: auto;
	}
	
	.left-panel {
		max-height: 50vh;
		border-right: none;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.right-panel {
		max-height: 50vh;
	}
}
</style>