public with sharing class multiselectToCollection {
    @InvocableMethod(label='Convert a multiselect value to a collection')
    public static List<Output> convert(List<Input> inputs){

        List<Output> outputs = new List<Output>();
        for(Input input : inputs){
            String delimiter = input.delimiter == null ? ';' : input.delimiter;
            outputs.add(new Output(input.value.trim().split(delimiter)));
        }
        return outputs;

    }

    public class Input{

        @InvocableVariable(label='Multiselect value to convert to a collection' required=true)
        public String value;

        @InvocableVariable(label='Delimeter (defaults to ";")')
        public String delimiter;

    }

    public class Output{

        public Output(List<String> value){
            this.value = value;
        }

        @InvocableVariable(label='Converted text collection')
        public List<String> value;

    }
}