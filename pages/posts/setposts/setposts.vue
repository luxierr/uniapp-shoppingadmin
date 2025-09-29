<template>
	<view class="postsbody">
		<view class="leftbox">
			<scroll-view class="databox" scroll-y="true">
				<view class="linebox">
					<view class="showbox">
						<view class="contentbox">{{content}}</view>
						<view class="showfilebox">
							<!-- <view v-if="isimage">
								<view class="imagebox">
									<image src=""></image>
								</view>
							</view>
							<view v-if="!isimage">
								<video id="myVideo" src=""
									@error="videoErrorCallback"   controls></video>
							</view> -->
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
								<uni-file-picker limit="9" title="最多选择9张图片"></uni-file-picker>
							</view>
						</uni-section>
						<uni-section title="只选择视频" type="line" v-if="!postdata.isimage">
							<view class="example-body">
								<uni-file-picker limit="1" file-mediatype="video" title="最多选择9个视频"></uni-file-picker>
							</view>
						</uni-section>
					</uni-forms-item>
				</uni-forms>
				<view class="btnbox">
					<button type="primary">发布</button>
					<button type="default">清空</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

				postdata: {
					content: '',
					isimage: true,
					url: []
				}
			}
		},
		onReady: function(res)  {
			this.videoContext = uni.createVideoContext('myVideo')
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
	.databox{
		/* border: 1px solid red; */
		height: 90vh;
	}
	.linebox{
		width: 100%;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* justify-items: center; */
	}
	.showbox{
		width: 90%;
		/* border: 1px solid #ccc; */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		height: 20vh;
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
	.btnbox{
		width: 100%;
		display: flex;
		flex-direction: row;
		/* border: 1px solid red; */
	}
	.contentbox{
		border: 1px solid red;
	}
	.showfilebox{
		border: 1px solid blue;
	}
</style>