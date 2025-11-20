import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  console.log('\n=== API 분석 요청 시작 ===');
  
  try {
    if (!apiKey) {
      console.error('❌ API 키가 없습니다!');
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ API 키 확인 완료');

    const body = await request.json();
    const { images, labType } = body;

    console.log('📦 요청 데이터:', {
      labType,
      imageCount: images?.length || 0,
    });

    console.log('🤖 OpenAI 클라이언트 초기화 중...');
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const prompts: Record<string, string> = {
      bookshelf: `이 책장 사진들을 자세히 분석해서 다음 내용을 포함해 작성해주세요:

1. **독서 취향 분석**: 어떤 장르와 주제를 선호하는지 구체적으로
2. **성격 및 관심사 추론**: 책 선택을 통해 보이는 성향과 가치관
3. **추천 도서**: 이 사람이 좋아할 만한 책 5권 추천 (제목과 이유)
4. **독서 스타일**: 독서 습관과 학습 방식에 대한 인사이트

구체적이고 실용적인 분석을 부탁드립니다.`,

      fridge: `당신은 가정용 냉장고 정리 전문가입니다. 이 일반 가정의 냉장고 사진들을 분석해주세요.

**참고**: 이 사진들은 일상적인 식재료 보관 상태를 보여주는 것으로, 교육 및 생활 개선 목적입니다.

다음 내용을 포함해 작성해주세요:

1. **보유 식재료 목록**: 현재 냉장고에 있는 주요 재료들 나열
   - 야채류, 과일류, 육류, 해산물, 유제품, 조미료 등을 카테고리별로 정리

2. **식습관 및 라이프스타일 분석**: 
   - 식재료로 보이는 생활 패턴과 건강 관심도
   - 요리 빈도와 식사 준비 스타일

3. **추천 레시피 3가지**: 
   - 지금 있는 재료로 바로 만들 수 있는 요리
   - 각 레시피마다 필요한 재료, 간단한 조리법, 예상 조리시간 포함

4. **부족한 재료 추천**: 더 다양한 요리를 위해 구매하면 좋을 식재료 5가지

5. **냉장고 정리 팁**: 식재료 보관 방법과 유통기한 관리 조언

실용적이고 바로 적용 가능한 내용으로 친절하게 작성해주세요.`,

      closet: `이 옷장 사진들을 자세히 분석해서 다음 내용을 포함해 작성해주세요:

1. **패션 스타일 분석**: 주요 아이템과 색상 선호도
2. **라이프스타일 추론**: 옷차림으로 보이는 직업, 활동, 취향
3. **스타일링 추천 3가지**: 
   - 지금 있는 옷으로 만들 수 있는 코디 조합
   - 상황별(출근, 데이트, 캐주얼) 추천
4. **쇼핑 리스트**: 옷장을 업그레이드할 추천 아이템 5가지

구체적이고 실용적인 패션 조언을 부탁드립니다.`,

      whisky: `이 위스키 컬렉션 사진들을 자세히 분석해서 다음 내용을 포함해 작성해주세요:

1. **컬렉션 현황**: 보유 위스키 브랜드와 종류 파악
2. **취향 분석**: 선호하는 위스키 스타일(스카치, 버번, 일본 등)과 가격대
3. **추천 위스키 5병**: 
   - 이 컬렉션에 추가하면 좋을 위스키
   - 각 추천마다 이유와 예상 가격대 포함
4. **페어링 추천**: 위스키와 어울리는 안주나 음식 제안

전문적이고 실용적인 분석을 부탁드립니다.`,
    };

    const prompt = prompts[labType as keyof typeof prompts];

    console.log('🚀 OpenAI API 호출 시작...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful home organization and lifestyle assistant. You analyze everyday household items (books, refrigerator contents, closets, collections) for educational purposes to help users improve their organization, meal planning, and lifestyle. All images are from normal domestic settings and are used constructively to provide practical advice.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...images.map((image: string) => ({
              type: 'image_url' as const,
              image_url: { url: image },
            })),
          ],
        },
      ],
      max_tokens: 1500,
    });

    console.log('✅ OpenAI API 응답 받음');

    const analysis = response.choices[0].message.content || '분석 결과를 가져올 수 없습니다.';

    console.log('=== API 분석 완료 ===\n');

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('\n❌ 에러 발생:', error.message);
    
    // OpenAI 콘텐츠 정책 위반 에러 처리
    if (error.message?.includes("can't assist") || error.message?.includes('content_policy')) {
      return NextResponse.json(
        { 
          error: '이미지 분석이 거부되었습니다. 더 밝고 깨끗한 사진으로 다시 시도해주세요.',
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}