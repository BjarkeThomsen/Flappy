class NeuralNetwork{

    constructor(a,b,c,d){
        if(a instanceof tf.Sequential){
            this.model=a
            this.in=b;
            this.hn=c;
            this.on=d;
        }else{
            this.in=a;
            this.hn=b;
            this.on=c;
            this.model=this.createModel();
        }
    }

    dispose(){
        this.model.dispose();
    }


    createModel(){
        const model=tf.sequential();
        
        const hidden = tf.layers.dense({
            inputShape: this.in,
            units: this.hn,
            activation: "sigmoid"
        })
        model.add(hidden);
        
        const output = tf.layers.dense({
            units: this.on,
            activation: "softmax"
        })
        model.add(output);

        return model;
    }

    predict(inputs){
        const xs = tf.tensor2d([inputs]);
        const ys = this.model.predict(xs);
        const outputs = ys.dataSync();
        xs.dispose();
        ys.dispose();
        return outputs;
    }

    copy(){
        return tf.tidy(()=>{
            const modelCopy=this.createModel();
            const weights = this.model.getWeights();
            const weightCopies = [];
            for(let i=0;i<weights.length;i++){
                weightCopies[i] = weights[i].clone();
            }
            modelCopy.setWeights(weightCopies);
            return new NeuralNetwork(modelCopy,this.in,this.hn,this.on);
        });
    }

    mutate(rate){
        tf.tidy(()=>{
            const weights = this.model.getWeights();
            const mutatedWeights = [];
            for(let i=0;i<weights.length;i++){
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for(let j=0;j<values.length;j++){
                    if(random(1) < rate){
                        let w = values[j];
                        values[j]= w + randomGaussian();
                    }
        
                }
                let newTensor = tf.tensor(values,shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }
}