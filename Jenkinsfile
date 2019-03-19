pipeline {
    agent {
        node {
            label 'nodejs-agent-v1'
        }
    }
    stages {
        stage('Node version') {
            steps {
                sh '. $NVM_DIR/nvm.sh && nvm use 6'
            }
        }
        stage('Make') {
            steps {
                sh '. $NVM_DIR/nvm.sh && make clean all'
            }
        }
    }
    post {
        always {
            script {
                GIT_COMMIT_EMAIL = sh (
                    script: 'git --no-pager show -s --format=\'%ae\'',
                    returnStdout: true
                ).trim()
            }
            emailext attachLog: true, body: '$DEFAULT_CONTENT', recipientProviders: [requestor()], subject: '$DEFAULT_SUBJECT',  to: "${GIT_COMMIT_EMAIL}"
        }
    }
}
