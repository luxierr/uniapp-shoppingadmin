<template>
	<view class="postsbody">
		<view class="leftbox">
			<scroll-view class="databox" scroll-y="true">
				<view class="linebox">
					<view class="showbox" v-for="(item,index) in postlist" :key="index">
						<view class="contentbox">{{item.content}}</view>
						<view class="showfilebox">
							<view v-if="item.isimage">
								<view class="imagebox">
									<div v-for="(line,urlkey) in item.url" :key="urlkey">
										<image :src="line" class="postsimage"></image>
									</div>
								</view>
							</view>
							<view v-if="!item.isimage">
								<video id="myVideo" :src="item.url[0]" @error="videoErrorCallback" controls></video>
							</view>
						</view>
						<view class="postsbtnlinebox">
							<view class="postsbtnbox">
								<!-- <button type="primary" size="mini">修改</button> -->
								<button type="warn" size="mini" @click="delposts(item)">删除</button>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

		</view>
		<view class="rightbox">
			<view class="rightbox_title">发布动态</view>
			<view class="setbox">
				<uni-forms ref="baseForm" :modelValue="postdata">
					<uni-forms-item label="动态内容">
						<view class="inputbox">
							<uni-easyinput type="textarea" v-model="postdata.content" placeholder="请输入自我介绍" />
						</view>
					</uni-forms-item>
					<uni-forms-item label="上传文件类型">
						<radio-group @change="handleRadioChange">
							<label>
								<radio value="true" :checked="postdata.isimage === true" />上传图片
							</label>
							<label>
								<radio value="false" :checked="postdata.isimage === false" />上传视频
							</label>
						</radio-group>
					</uni-forms-item>
					<uni-forms-item label="上传文件">
						<uni-section title="只选择图片" type="line" v-if="postdata.isimage">
							<view class="example-body">
								<uni-file-picker limit="9" title="最多选择9张图片" file-mediatype="image"
									:imageStyles="imageStyles" @success="handleUploadSuccess" @fail="handleUploadFail"
									@delete="handleDelFile"></uni-file-picker>
							</view>
						</uni-section>
						<uni-section title="只选择视频" type="line" v-if="!postdata.isimage">
							<view class="example-body">
								<uni-file-picker limit="1" file-mediatype="video" title="最多选择9个视频"
									@success="handleUploadSuccess" @fail="handleUploadFail"
									@delete="handleDelFile"></uni-file-picker>
							</view>
						</uni-section>
					</uni-forms-item>
				</uni-forms>
				<view class="btnbox">
					<button type="primary" @click="addposts">发布</button>
					<button type="default" @click="cleandata">清空</button>
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
							data::{
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

<style>
	.postsbody {
		border: 1px solid red;
		height: 90vh;
		display: flex;
		flex-direction: row;
	}

	.leftbox {
		width: 40%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.rightbox {
		width: 60%;
		border-left: 1px solid #ccc;
	}

	.databox {
		/* border: 1px solid red; */
		height: 90vh;
	}

	.linebox {
		width: 100%;
		/* border: 1px solid black; */
		display: flex;
		flex-direction: column;
		align-items: center;
		/* justify-items: center; */
	}

	.showbox {
		width: 90%;
		/* border: 1px solid #ccc; */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		/* height: 20vh; */
		border-radius: 10px;
		margin-top: 2vh;
	}



	.rightbox_title {
		font-size: 22px;
		padding-left: 1vw;
		margin-top: 1vh;

	}

	.setbox {
		margin-top: 2vh;
		padding-left: 1vw;
		padding-right: 1vw;
	}

	.inputbox {
		width: 80%;
	}

	.btnbox {
		width: 100%;
		display: flex;
		flex-direction: row;
		/* border: 1px solid red; */
	}

	.contentbox {
		/* border: 1px solid red; */
		margin: 10px;
	}

	.showfilebox {
		/* border: 1px solid blue; */
	}

	.imagebox {
		/* border: 1px solid green; */
		display: flex;
		flex-direction: row;
		margin: 16px 10px;
		flex-wrap: wrap;
	}

	.postsimage {
		max-height: 120px;
		max-width: 120px;
		margin-right: 5px;
	}

	.postsbtnlinebox {
		width: 100%;
		/* border: 1px solid red; */
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		/* 垂直居中 */
		justify-content: flex-end;
		/* 水平靠右 */
		padding-right: 10px;
		/* 右边留白 */
		box-sizing: border-box;
		/* 避免宽度溢出 */
	}

	.postsbtnbox button {
		margin-left: 10px;
	}
</style>