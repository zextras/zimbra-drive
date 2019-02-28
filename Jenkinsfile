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
}
