pipeline {
    agent {
        node {
            label 'nodejs-agent-v1'
        }
    }
    options {
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    stages {
        stage('Node version') {
            steps {
                sh '. /usr/bin/load_nvm && nvm use 6'
            }
        }
        stage('Make') {
            steps {
                sh '. /usr/bin/load_nvm && make clean all'
                archiveArtifacts artifacts: "dist/zimbra_drive.tgz", fingerprint: true
                archiveArtifacts artifacts: "dist/zimbradrive.tar.gz", fingerprint: true
                archiveArtifacts artifacts: "dist/zimbra_drive.md5", fingerprint: true
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
