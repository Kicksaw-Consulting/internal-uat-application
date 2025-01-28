@isTest
public with sharing class multiselectToCollection_Test {
    @isTest
    public static void test_without_delimeter(){
        String stringToConvertToList = 'a;b;c;d';

        multiselectToCollection.Input input = new multiselectToCollection.Input();
        input.value = stringToConvertToList;
        
        System.Test.startTest();
        List<multiselectToCollection.Output> outputs =  multiselectToCollection.convert(new List<multiselectToCollection.Input>{input});
        System.Test.stopTest();

        List<String> convertedStringToAssert = new List<String>{'a','b','c','d'};
        for(multiselectToCollection.Output output : outputs){
            system.assertEquals(convertedStringToAssert, output.value);
        }
    }

    @isTest
    public static void test_with_delimeter(){
        String stringToConvertToList = 'a,b,c,d';
        
        multiselectToCollection.Input input = new multiselectToCollection.Input();
        input.value = stringToConvertToList;
        input.delimiter = ',';
        
        System.Test.startTest();
        List<multiselectToCollection.Output> outputs =  multiselectToCollection.convert(new List<multiselectToCollection.Input>{input});
        System.Test.stopTest();

        List<String> convertedStringToAssert = new List<String>{'a','b','c','d'};
        for(multiselectToCollection.Output output : outputs){
            system.assertEquals(convertedStringToAssert, output.value);
        }
    }
}