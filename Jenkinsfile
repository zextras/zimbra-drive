pipeline {
    agent {
        node {
            label 'nodejs-agent-v1'
        }
    }
    stages {
        stage('Node version') {
            steps {
                sh 'nvm use 6'
            }
        }
        stage('Make') {
            steps {
                sh 'make clean all'
            }
        }
    }
}
