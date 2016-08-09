import AWS from 'aws-sdk';
const AUTOTAG_TAG_NAME = 'ExUserID';
const AUTOTAG_TAG_DATE = 'ExCreationDate';
const ROLE_PREFIX = 'arn:aws:iam::';
const ROLE_SUFFIX = ':role';
const DEFAULT_STACK_NAME = 'autotag';
const MASTER_ROLE_NAME = 'AutoTagMasterRole';
const MASTER_ROLE_PATH = '/gorillastack/autotag/master/';

class AutotagDefaultWorker {
  constructor(event, s3Region) {
    this.event = event;
    this.s3Region = s3Region;
  }

  /* tagResource
  ** method: tagResource
  **
  ** Do nothing
  */
  tagResource() {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        // Do nothing
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  getRoleName() {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        let cloudFormation = new AWS.CloudFormation({ region: _this.s3Region });
        cloudFormation.describeStackResource({
          StackName: DEFAULT_STACK_NAME,
          LogicalResourceId: MASTER_ROLE_NAME
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.StackResourceDetail.PhysicalResourceId);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  assumeRole(roleName) {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        AWS.config.region = 'us-east-1';
        let sts = new AWS.STS();
        sts.assumeRole({
          RoleArn: ROLE_PREFIX + _this.event.recipientAccountId + ROLE_SUFFIX + MASTER_ROLE_PATH + roleName,
          RoleSessionName: 'AutoTag-' + (new Date()).getTime(),
          DurationSeconds: 900
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            let credentials = {
              accessKeyId: data.Credentials.AccessKeyId,
              secretAccessKey: data.Credentials.SecretAccessKey,
              sessionToken: data.Credentials.SessionToken
            };
            resolve(credentials);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  dumpEventInfo() {
    console.log('Event Name: ' + this.event.eventName);
    console.log('Event Type: ' + this.event.eventType);
    console.log('Event Source: ' + this.event.eventSource);
    console.log('AWS Region: ' + this.event.awsRegion);
    console.log('---');
  }

  getAutotagPair() {
    return {
      Key: this.getUserIDTagName(),
      Value: this.getUserIDTagValue()
    };
  }
  
  getAutotagPair2() {
      return {
        Key: this.getDateTagName(),
        Value: this.getDateTagValue()
      }
  }
  
  getUserIDTagName() {
    return AUTOTAG_TAG_NAME;
  }

  getUserIDTagValue() {
    return this.event.userIdentity.arn;
  }
  getDateTagName() {
	return AUTOTAG_TAG_DATE;
  }
  
  getDateTagValue() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1;
		var yyyy = today.getFullYear();
		var hh = today.getHours();
		var minmin = today.getMinutes();

		if (dd < 10) {
			dd = '0' + dd;
		} 
		if (mm < 10) {
			mm = '0' + mm;	
		} 
		if (hh < 10) {
			hh = '0' + hh;
		}
		if (minmin < 10) {
			minmin = '0' + minmin;
		}

		today = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + minmin + ' UTC';
		return today;
	}
};

export default AutotagDefaultWorker;
