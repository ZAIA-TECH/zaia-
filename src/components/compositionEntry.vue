<template>
  <div class="compos_entry">
    <textarea :style="{ height: textareaHeight + 'px' }" id="inputBox" :placeholder="props.placeholder" v-model="content"></textarea>
    <!-- <span id="errorText" class="error"></span> -->
  </div>
</template>

<script setup>
  import { useStore } from '@/stores';
  import { onMounted, defineProps, defineEmits, ref, watch } from 'vue'
  import { countEnWords } from '@/utils/utils'
  const props = defineProps({
    textareaHeight: {},
    wordMaxLength: 0,
    modelValue: '',
    placeholder: '',
    isZH: true,
  })

  const content = ref(props.modelValue);

  watch(() => props.modelValue, (newV) => {
    content.value = newV;
  })

  const store = useStore();

  const emit = defineEmits(['updateWordLength', 'update:modelValue'])


  const countCharacters = (str) => {
    const chinesePattern = /[\u4e00-\u9fa5]/g;
    const letterPattern = /[a-zA-Z]/g;
    const digitPattern = /\d/g;

    const chineseMatches = str.match(chinesePattern);
    const letterMatches = str.match(letterPattern);
    const digitMatches = str.match(digitPattern);

    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    const letterCount = letterMatches ? letterMatches.length : 0;
    const digitCount = digitMatches ? digitMatches.length : 0;

    return { chinese: chineseCount, letter: letterCount, digit: digitCount };
  }

  const truncateText = (text, maxLength) => {
    let truncatedValue = text;
    // 统计截断后的汉字、字母、数字的个数
    let counts = props.isZH ? countCharacters(truncatedValue) : countEnWords(truncatedValue);
    let totalCount = props.isZH ? counts.chinese + counts.letter + counts.digit : counts;

    // 如果截断后的总数超过，则调整截断位置
    if (totalCount > props.wordMaxLength) {
      while (totalCount > props.wordMaxLength && maxLength > 0) {
        maxLength--;
        truncatedValue = text.substring(0, maxLength);
        counts = props.isZH ? countCharacters(truncatedValue) : countEnWords(truncatedValue);
        totalCount = props.isZH ? counts.chinese + counts.letter + counts.digit : counts;
        emit('updateWordLength', totalCount)
      }
    }

    return truncatedValue;  
  }

  onMounted(() => {

    const inputBox = document.getElementById("inputBox");
    let truncatedValue = '';

    inputBox.addEventListener("input", function () {
      const inputValue = inputBox.value;
      truncatedValue = inputValue;
      if(props.isZH) {
        // 统计汉字、字母、数字的个数
        const counts = countCharacters(inputValue);
        const totalCount = counts.chinese + counts.letter + counts.digit;
        emit('updateWordLength', totalCount)
        // 如果总数超过，则截断文本框的值
        if (totalCount > props.wordMaxLength) {
          truncatedValue = truncateText(inputValue, inputValue.length);
          inputBox.value = truncatedValue;
        }
        emit('update:modelValue', truncatedValue)
      } else {
        const count = countEnWords(inputValue)
        if(count > props.wordMaxLength) {
          truncatedValue = truncateText(inputValue, inputValue.length);
          inputBox.value = truncatedValue;     
        }
        emit('update:modelValue', truncatedValue)
        emit('updateWordLength', Math.min(countEnWords(inputBox.value), props.wordMaxLength))
      }
      
    });
  })

</script>

<style lang="scss" scoped>
  .compos_entry {
    padding: 12px 0;
    display: flex;
    textarea {
      display: block;
      flex: 1;
      resize: none;
      border: none;
      font-size: 15px;
      color: #666;
      &::placeholder {
        color: #ccc;
      }
    }
  }
</style>